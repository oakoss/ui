import { describe, expect, it } from 'vitest';

import { zIndex } from '#/z-index';

describe('zIndex', () => {
  // A tie leaves the stacking to DOM order.
  it('gives every layer its own value', () => {
    expect(new Set(Object.values(zIndex)).size).toBe(
      Object.keys(zIndex).length,
    );
  });

  it('stacks layers from page chrome up to tooltips', () => {
    const order = Object.entries(zIndex)
      .toSorted(([, a], [, b]) => a - b)
      .map(([layer]) => layer);
    expect(order).toEqual([
      'sticky',
      'overlay',
      'modal',
      'toast',
      'popover',
      'tooltip',
    ]);
  });
});
