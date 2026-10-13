import { describe, expect, it } from 'vitest';

import type { Family } from '#/family';

import { oklch } from '#/color';
import { colorDifference, contrastRatio, isOpaque, overlay } from '#/contrast';
import { tailwindScales } from '#/families/tailwind-scales';
import { families, styles } from '#/index';
import { contrastMinimum, contrastPairs } from '#/roles';
import { withScale } from '#/testing';
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
  return pairFailures(family, flavor, primary);
}

function pairFailures(
  family: Family,
  flavor: string,
  primary: string,
): string[] {
  const theme = resolveTheme(family, flavor, primary);
  if (Array.isArray(theme)) return theme;
  return checkedPairs.flatMap(({ background, foreground, kind }) => {
    const back = theme.tokens[background];
    const fore = theme.tokens[foreground];
    if (back === undefined || fore === undefined) {
      return `${foreground} on ${background}: missing token`;
    }
    if (!isOpaque(back) || !isOpaque(fore)) {
      return `${foreground} on ${background}: translucent`;
    }
    const ratio = contrastRatio(fore, back);
    const minimum = contrastMinimum[kind];
    return ratio >= minimum
      ? []
      : `${foreground} on ${background}: ${ratio.toFixed(2)} < ${minimum}`;
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

// Each Tailwind accent replaced by a scale seeded from one of its steps, so
// the role-step picks run over generated steps.
const seededThemes = families.zinc.intents.primary.choices
  .filter((hue) => hue !== 'zinc')
  .flatMap((hue) =>
    ([400, 500, 600] as const).flatMap((step) =>
      (['light', 'dark'] as const).map(
        (flavor) => [hue, step, flavor] as const,
      ),
    ),
  );

describe('WCAG 2.2 AA contrast with seeded scales', () => {
  it.each(seededThemes)('%s seeded from %s, %s', (hue, step, flavor) => {
    const seed = tailwindScales[hue].steps[step];
    const family = withScale(hue, { kind: 'seeded', seed });
    expect(pairFailures(family, flavor, hue)).toEqual([]);
  });

  // Pastel and extreme seeds, as primary through the blue slot.
  it.each([
    ['Nord frost', oklch(78.24, 0.0617, 214.9)],
    ['Mocha mauve', oklch(78.71, 0.1187, 304.8)],
    ['a near-white tint', oklch(97.5, 0.02, 250)],
    ['a near-black', oklch(27, 0.05, 250)],
  ] as const)('%s', (_, seed) => {
    const family = withScale('blue', { kind: 'seeded', seed });
    expect([
      ...pairFailures(family, 'light', 'blue'),
      ...pairFailures(family, 'dark', 'blue'),
    ]).toEqual([]);
  });
});

// A style's field fill paints inside the control, so the border must also
// clear 3:1 against the filled surface.
function fieldFailures(
  familyId: string,
  flavor: string,
  primary: string,
): string[] {
  const family = Object.values(families).find(({ id }) => id === familyId);
  if (family === undefined) return [`no family ${familyId}`];
  const theme = resolveTheme(family, flavor, primary);
  if (Array.isArray(theme)) return theme;
  const { input } = theme.tokens;
  return Object.values(styles).flatMap((style) => {
    const fill = style.colors.field[theme.polarity];
    if (fill === 'transparent') return [];
    const top = theme.tokens[fill.role];
    return (['background', 'card', 'popover'] as const).flatMap((surface) => {
      const bottom = theme.tokens[surface];
      if (input === undefined || top === undefined || bottom === undefined) {
        return `${style.id} on ${surface}: missing token`;
      }
      const ratio = contrastRatio(input, overlay(top, fill.alpha, bottom));
      return ratio >= contrastMinimum['non-text']
        ? []
        : `${style.id} on ${surface}: ${ratio.toFixed(2)}`;
    });
  });
}

describe('control border against the field fill', () => {
  it.each(themes)('%s %s with a %s primary', (familyId, flavor, primary) => {
    expect(fieldFailures(familyId, flavor, primary)).toEqual([]);
  });
});
