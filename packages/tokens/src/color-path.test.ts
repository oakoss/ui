import { describe, expect, it } from 'vitest';

import { colorPathLabel } from '#/color-path';

describe('colorPathLabel', () => {
  it('names a palette color as Tailwind does', () => {
    expect(colorPathLabel('color.zinc.950')).toBe('zinc-950');
    expect(colorPathLabel('color.white')).toBe('white');
  });

  it('passes anything else through unchanged', () => {
    expect(colorPathLabel('zinc.950')).toBe('zinc.950');
    expect(colorPathLabel('color.a.b.c')).toBe('color.a.b.c');
  });
});
