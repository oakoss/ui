import { expect, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';
import { finished } from '#/overlays/overlay-test';

import { demoStore } from './toast-demo';

const peek = 12;
// The room the region leaves above and below the stack.
const inset = 32;

export const forever = { duration: Infinity } as const;

const tall = 'A second line makes it taller than the others.';

export async function isCollapsed(toasts: HTMLElement[]) {
  await waitFor(async () => {
    await expect(part('toast-viewport')).not.toHaveAttribute('data-expanded');
  });
  await Promise.all(toasts.map((toast) => finished(toast)));
  const [front, ...behind] = toasts;
  const bottoms = toasts.map((toast) => toast.getBoundingClientRect().bottom);
  // Each older toast peeks out above the one in front of it.
  await expect(
    bottoms.slice(1).every((bottom, index) => bottom < (bottoms[index] ?? 0)),
  ).toBe(true);
  // The ones behind take the front toast's height, their content hidden.
  await expect(behind.map((toast) => toast.offsetHeight)).toEqual(
    behind.map(() => front?.offsetHeight),
  );
  await expect(behind.map((toast) => innerOpacity(toast))).toEqual(
    behind.map(() => '0'),
  );
  await expect(innerOpacity(front)).toBe('1');
  // Collapsed, the region holds the front toast and the peeks.
  await expect(part('toast-viewport').offsetHeight).toBe(
    (front?.offsetHeight ?? 0) + behind.length * peek + inset,
  );
}

export async function isExpanded(toasts: HTMLElement[]) {
  await waitFor(async () => {
    await expect(part('toast-viewport')).toHaveAttribute('data-expanded');
  });
  await Promise.all(toasts.map((toast) => finished(toast)));
  // One after another, without overlapping, all inside the region.
  const boxes = toasts.map((toast) => toast.getBoundingClientRect());
  await expect(
    boxes
      .slice(1)
      .every((older, index) => older.bottom <= (boxes[index]?.top ?? 0)),
  ).toBe(true);
  await expect(toasts.map((toast) => innerOpacity(toast))).toEqual(
    toasts.map(() => '1'),
  );
  await expect(
    part('toast-viewport').getBoundingClientRect().top,
  ).toBeLessThanOrEqual(boxes.at(-1)?.top ?? 0);
}

// Shows three toasts, newest first in the result, with one taller than the
// rest: the newest by default, or the oldest so the toasts behind the front
// one have to be clipped to its height.
export async function showThree(tallest: 'newest' | 'oldest' = 'newest') {
  demoStore.show('Oldest', {
    ...forever,
    ...description(tallest === 'oldest'),
  });
  demoStore.show('Middle', forever);
  demoStore.show('Newest', {
    ...forever,
    ...description(tallest === 'newest'),
  });
  const toasts = await waitFor(() =>
    ['Newest', 'Middle', 'Oldest'].map((name) => toastTitled(name)),
  );
  await Promise.all(toasts.map((toast) => finished(toast)));
  return toasts;
}

// Past the visible count a toast has no accessible name, so the stories find
// each by its title.
export function toastTitled(name: string) {
  const title = [...document.querySelectorAll('[data-slot=toast-title]')].find(
    (element) => element.textContent === name,
  );
  const toast = title?.closest('[data-slot=toast]');
  if (!(toast instanceof HTMLElement)) throw new Error(`No toast ${name}`);
  return toast;
}

function description(isTall: boolean) {
  return isTall ? { description: tall } : {};
}

function innerOpacity(toast: HTMLElement | undefined) {
  return toast ? getComputedStyle(part('toast-inner', toast)).opacity : '';
}
