import { describe, expect, it } from 'vitest';

import { isValidColor, oklch } from '#/color';

describe('isValidColor', () => {
  it.each([
    ['black', oklch(0, 0, null), true],
    ['white', oklch(100, 0, null), true],
    ['hue just under 360', oklch(50, 0.1, 359.9), true],
    ['hue 360', oklch(50, 0.1, 360), false],
    ['negative hue', oklch(50, 0.1, -1), false],
    ['negative chroma', oklch(50, -0.01, 30), false],
    ['negative lightness', oklch(-1, 0, null), false],
    ['lightness over 1', oklch(101, 0, null), false],
    ['alpha 1', oklch(50, 0, null, 1), true],
    ['alpha over 1', oklch(50, 0, null, 1.01), false],
    ['negative alpha', oklch(50, 0, null, -0.01), false],
    ['alpha NaN', oklch(50, 0, null, NaN), false],
    ['infinite chroma', oklch(50, Infinity, 30), false],
    ['chroma above 1', oklch(50, Number.MAX_VALUE, 30), false],
  ])('%s → %s', (_, color, valid) => {
    expect(isValidColor(color)).toBe(valid);
  });
});
