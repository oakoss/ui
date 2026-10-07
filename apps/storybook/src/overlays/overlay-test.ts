import { expect, waitFor } from 'storybook/test';

// The element enters from, and exits toward, `translate`, fading and scaling
// from 95%.
export async function expectSlide(element: HTMLElement, translate: string) {
  const hidden = { opacity: '0', scale: '0.95', translate };
  await expect(await inState(element, 'entering', slideStyle)).toEqual(hidden);
  await expect(await inState(element, 'exiting', slideStyle)).toEqual(hidden);
}

// Reads a settled element with React Aria's entering or exiting attribute set,
// since the real state has ended by the time a story can measure.
export async function inState<T>(
  element: HTMLElement,
  state: 'entering' | 'exiting',
  read: (element: HTMLElement) => T,
) {
  element.toggleAttribute(`data-${state}`, true);
  await finished(element);
  const value = read(element);
  element.toggleAttribute(`data-${state}`, false);
  await finished(element);
  return value;
}

// Resolves once the enter transition finishes, so measurements read the
// element where it rests.
export async function settled(element: HTMLElement) {
  await waitFor(async () => {
    await expect(element).not.toHaveAttribute('data-entering');
  });
  await finished(element);
}

async function finished(element: HTMLElement) {
  await Promise.all(element.getAnimations().map((a) => a.finished));
}

function slideStyle(element: HTMLElement) {
  const { opacity, scale, translate } = getComputedStyle(element);
  return { opacity, scale, translate };
}
