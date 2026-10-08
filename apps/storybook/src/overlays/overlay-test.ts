import { setInteractionModality } from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

// Long enough for a delayed open or close on a busy CI runner.
export const slowTimeout = 3000;

// Resolves once the element starts its exit, which marks when a close delay
// ended; the element stays mounted until the transition finishes.
export async function exitStarted(element: HTMLElement) {
  await waitFor(
    async () => {
      await expect(element).toHaveAttribute('data-exiting');
    },
    { timeout: slowTimeout },
  );
}

// Resolves `find` and checks at least `delay` ms passed since `start`. Only a
// lower bound holds: a slow runner stretches time, never shortens it.
export async function expectAfter<T>(
  start: number,
  delay: number,
  find: () => Promise<T>,
) {
  const result = await find();
  await expect(performance.now() - start).toBeGreaterThanOrEqual(delay - 5);
  return result;
}

// The element enters from, and exits toward, `translate`, fading and scaling
// from 95%.
export async function expectSlide(element: HTMLElement, translate: string) {
  const hidden = { opacity: '0', scale: '0.95', translate };
  await expect(await inState(element, 'entering', slideStyle)).toEqual(hidden);
  await expect(await inState(element, 'exiting', slideStyle)).toEqual(hidden);
}

// Hovers as a fresh pointer and returns when the hover began. React Aria opens
// a tooltip or hover card on hover only after pointer input, which a
// pointerenter alone doesn't record, and they share one warm-up that cools
// down 500ms after a close is requested, never on unmount. So this waits out
// that cooldown, and a hover story ends with `leave`.
export async function hoverFresh(element: HTMLElement) {
  // The browser's real pointer rests over the story on CI. Forcing layout now
  // delivers its pointerover during the wait; arriving after the hover, it
  // would end the hover before the overlay opens.
  element.getBoundingClientRect();
  await wait(600);
  setInteractionModality('pointer');
  const start = performance.now();
  await userEvent.hover(element);
  return start;
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

// Unhovers, which requests the close that starts the shared cooldown, and
// waits for the overlay to unmount.
export async function leave(element: HTMLElement, role: 'dialog' | 'tooltip') {
  await userEvent.unhover(element);
  await waitFor(
    async () => {
      await expect(screen.queryByRole(role)).toBeNull();
    },
    { timeout: slowTimeout },
  );
}

// Resolves once the enter transition finishes, so measurements read the
// element where it rests.
export async function settled(element: HTMLElement) {
  await waitFor(async () => {
    await expect(element).not.toHaveAttribute('data-entering');
  });
  await finished(element);
}

export function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function finished(element: HTMLElement) {
  await Promise.all(element.getAnimations().map((a) => a.finished));
}

function slideStyle(element: HTMLElement) {
  const { opacity, scale, translate } = getComputedStyle(element);
  return { opacity, scale, translate };
}
