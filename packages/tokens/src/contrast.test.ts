import { describe, expect, it } from 'vitest';

import { oklch } from '#/color';
import { colorDifference, contrastRatio, isOpaque, overlay } from '#/contrast';
import { families } from '#/index';
import { contrastMinimum, contrastPairs } from '#/roles';
import { resolveTheme } from '#/theme';

const themes = Object.values(families).flatMap((family) =>
  Object.keys(family.flavors).flatMap((flavor) =>
    family.intents.primary.choices.map(
      (primary) => [family.id, flavor, primary] as const,
    ),
  ),
);

const checkedPairs = contrastPairs.filter(({ kind }) => kind !== 'decorative');

function failures(familyId: string, flavor: string, primary: string): string[] {
  const family = Object.values(families).find(({ id }) => id === familyId);
  if (family === undefined) return [`no family ${familyId}`];
  const theme = resolveTheme(family, flavor, primary);
  if (Array.isArray(theme)) return theme;
  return checkedPairs.flatMap(({ background, foreground, kind }) => {
    const back = theme.tokens[background];
    const fore = theme.tokens[foreground];
    if (back === undefined || fore === undefined) {
      return [`${foreground} on ${background}: missing token`];
    }
    if (!isOpaque(back) || !isOpaque(fore)) {
      return [`${foreground} on ${background}: translucent`];
    }
    const ratio = contrastRatio(fore, back);
    const minimum = contrastMinimum[kind];
    return ratio >= minimum
      ? []
      : [`${foreground} on ${background}: ${ratio.toFixed(2)} < ${minimum}`];
  });
}

describe('overlay', () => {
  const white = oklch(100, 0, null);
  const red = oklch(60, 0.2, 25);

  it('returns the bottom at 0 and the top at 1', () => {
    expect(colorDifference(overlay(red, 0, white), white)).toBeLessThan(0.01);
    expect(colorDifference(overlay(red, 1, white), red)).toBeLessThan(0.01);
  });

  // An OKLCH blend would give 0.5; browsers blend in sRGB.
  it('blends in sRGB', () => {
    const [lightness] = overlay(oklch(0, 0, null), 0.5, white).components;
    expect(lightness).toBeCloseTo(0.598, 3);
  });

  it('refuses translucent colors', () => {
    expect(() => overlay(oklch(0, 0, null, 0.5), 0.1, white)).toThrow(
      'overlay needs opaque colors',
    );
  });
});

describe('WCAG 2.2 AA contrast', () => {
  it.each(themes)('%s %s with a %s primary', (familyId, flavor, primary) => {
    expect(failures(familyId, flavor, primary)).toEqual([]);
  });
});
