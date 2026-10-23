import { expect, test } from 'vitest';

import type { ToastItem } from '#/lib/toast/toast-store';

import { resolveContent } from '#/lib/toast/toast-content';
import { stackToasts, toastGap } from '#/lib/toast/toast-stack';

function item(instance: number, isExiting = false): ToastItem {
  return {
    content: resolveContent(`Toast ${String(instance)}`, {}, 'neutral'),
    instance,
    isExiting,
    key: `toast-${String(instance)}`,
    version: instance,
  };
}

// Newest first, as the store lists them.
const items = [item(3), item(2), item(1), item(0)];
const heights = new Map([
  [0, 30],
  [1, 50],
  [2, 40],
  [3, 60],
]);

function layout(options: Partial<Parameters<typeof stackToasts>[0]> = {}) {
  return stackToasts({
    heights,
    isExpanded: false,
    items,
    side: 'bottom',
    visible: 3,
    ...options,
  });
}

test('collapsed, the next toasts peek behind the front one, smaller', () => {
  const { height, placed } = layout();
  expect(placed.map(({ slot }) => slot.offset)).toEqual([-0, -12, -24, -24]);
  expect(placed.map(({ slot }) => slot.scale)).toEqual([1, 0.95, 0.9, 0.9]);
  expect(placed.map(({ slot }) => slot.isBehind)).toEqual([
    false,
    true,
    true,
    true,
  ]);
  expect(height).toBe(60 + 2 * 12);
});

test('expanded, toasts follow one another by their heights', () => {
  const { height, placed } = layout({ isExpanded: true });
  expect(placed.map(({ slot }) => slot.offset)).toEqual([
    -0,
    -(60 + toastGap),
    -(60 + 40 + 2 * toastGap),
    -(60 + 40 + 50 + 3 * toastGap),
  ]);
  expect(placed.map(({ slot }) => slot.scale)).toEqual([1, 1, 1, 1]);
  expect(placed.map(({ slot }) => slot.isBehind)).toEqual([
    false,
    false,
    false,
    false,
  ]);
  expect(height).toBe(60 + 40 + 50 + 2 * toastGap);
});

test('past the visible count a toast is hidden and takes no room', () => {
  const { height, placed } = layout({ isExpanded: true, visible: 2 });
  expect(placed.map(({ slot }) => slot.isHidden)).toEqual([
    false,
    false,
    true,
    true,
  ]);
  expect(height).toBe(60 + 40 + toastGap);
});

test('a toast past the visible count waits until the ones in front have gone', () => {
  const exiting = [item(3, true), item(2), item(1), item(0)];
  const { placed } = layout({ items: exiting, visible: 2 });
  expect(placed.map(({ slot }) => slot.isHidden)).toEqual([
    false,
    false,
    true,
    true,
  ]);
});

test('hidden toasts stay hidden when every toast exits at once', () => {
  const exiting = items.map(({ instance }) => item(instance, true));
  const { placed } = layout({ items: exiting, visible: 2 });
  expect(placed.map(({ slot }) => slot.isHidden)).toEqual([
    false,
    false,
    true,
    true,
  ]);
});

test('at the top, toasts move down from the edge', () => {
  const { placed } = layout({ side: 'top' });
  expect(placed.map(({ slot }) => slot.offset)).toEqual([0, 12, 24, 24]);
});

test('newer toasts sit above older ones', () => {
  const { placed } = layout();
  expect(placed.map(({ slot }) => slot.z)).toEqual([4, 3, 2, 1]);
});

test('a visible count under 1 still shows the front toast', () => {
  const { placed } = layout({ visible: 0 });
  expect(placed[0]?.slot.isHidden).toBe(false);
});

test('a hidden toast stays hidden while it exits', () => {
  const exiting = [item(3), item(2), item(1, true), item(0)];
  const { placed } = layout({ items: exiting, visible: 2 });
  expect(placed.map(({ slot }) => slot.isHidden)).toEqual([
    false,
    false,
    true,
    true,
  ]);
});
