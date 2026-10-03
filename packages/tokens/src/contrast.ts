import { differenceCiede2000, type Oklch, toGamut, wcagContrast } from 'culori';

import type { Color } from '#/color';

const toSrgb = toGamut('rgb', 'oklch');
const ciede2000 = differenceCiede2000();

// CIEDE2000, measured as displayed (sRGB); 1 is about the smallest
// difference people notice.
export function colorDifference(a: Color, b: Color): number {
  if (!isOpaque(a) || !isOpaque(b)) {
    throw new Error('color difference needs opaque colors');
  }
  return ciede2000(toSrgb(toCulori(a)), toSrgb(toCulori(b)));
}

// WCAG 2.x is defined in sRGB, so both colors are gamut-mapped first.
export function contrastRatio(a: Color, b: Color): number {
  if (!isOpaque(a) || !isOpaque(b)) {
    throw new Error('contrast needs opaque colors');
  }
  const ratio = wcagContrast(toSrgb(toCulori(a)), toSrgb(toCulori(b)));
  if (!Number.isFinite(ratio)) throw new Error('contrast of an invalid color');
  return ratio;
}

export function isOpaque(color: Color): boolean {
  return color.alpha === undefined || color.alpha === 1;
}

function toCulori(color: Color): Oklch {
  const [l, c, h] = color.components;
  return h === null ? { c, l, mode: 'oklch' } : { c, h, l, mode: 'oklch' };
}
