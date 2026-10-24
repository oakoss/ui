import type { ToastCloseReason } from '@oakoss/ui/lib/toast/toast-content';

import { expect, fn, waitFor } from 'storybook/test';

import { finished } from '#/overlays/overlay-test';

import { demoStore, findToast } from './toast-demo';

export function pointer(
  type: string,
  target: Element,
  x: number,
  y: number,
  pointerType: string,
  { isPrimary = true, pointerId = 7 } = {},
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      clientX: x,
      clientY: y,
      isPrimary,
      pointerId,
      pointerType,
    }),
  );
}

export async function showOne({ hasAction = false } = {}) {
  const onClose = fn<(reason: ToastCloseReason) => void>();
  if (hasAction) {
    demoStore.show('Saved', {
      action: {
        label: 'Undo',
        onPress: () => Promise.withResolvers<undefined>().promise,
      },
      onClose,
    });
  } else {
    demoStore.show('Saved', { duration: Infinity, onClose });
  }
  const toast = await findToast('Saved');
  // The enter transition starts a frame after mount.
  await waitFor(async () => {
    await expect(toast).not.toHaveAttribute('data-entering');
  });
  await finished(toast);
  return { onClose, toast };
}

export async function sprangBack(toast: HTMLElement) {
  await finished(toast);
  await expect(toast).toBeInTheDocument();
  await expect(toast).not.toHaveAttribute('data-exiting');
  await expect(getComputedStyle(toast).transform).toMatch(
    /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/u,
  );
}

// Presses at the target's center, moves by (dx, dy) in four steps, holds for
// `ms`, then lifts or cancels.
export async function swipe(
  target: Element,
  [dx, dy]: readonly [number, number],
  {
    end = 'pointerup',
    ms = 0,
    pointerType = 'touch',
  }: { end?: string; ms?: number; pointerType?: string } = {},
) {
  const box = target.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  pointer('pointerdown', target, x, y, pointerType);
  for (const step of [1, 2, 3, 4]) {
    pointer(
      'pointermove',
      target,
      x + (dx * step) / 4,
      y + (dy * step) / 4,
      pointerType,
    );
  }
  if (ms > 0) {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  pointer(end, target, x + dx, y + dy, pointerType);
}
