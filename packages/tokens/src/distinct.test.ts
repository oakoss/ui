import { type Oklch, oklch, rgb } from 'culori';
import { describe, expect, it } from 'vitest';

import type { Color } from '#/color';

import { colorDifference } from '#/contrast';
import { families } from '#/index';
import { distinctMinimum, distinctPairs, type Role } from '#/roles';
import { resolveTheme, type Theme } from '#/theme';

const themes = Object.values(families).flatMap((family) =>
  Object.keys(family.flavors).flatMap((flavor) =>
    family.intents.primary.choices.map(
      (primary) => [family.id, flavor, primary] as const,
    ),
  ),
);

function check(label: string, a: Color, b: Color): string[] {
  const difference = colorDifference(a, b);
  return difference >= distinctMinimum
    ? []
    : [`${label}: ${difference.toFixed(2)} < ${distinctMinimum}`];
}

// Neutral has no role set; its hovers are opacity over existing roles.
function neutralFailures(theme: Theme): string[] {
  const background = token(theme, 'background');
  const border = token(theme, 'border');
  const foreground = token(theme, 'foreground');
  const secondary = token(theme, 'secondary');
  return [
    // Dark themes make the border translucent.
    ...check(
      'background vs a border border',
      background,
      over(border, border.alpha ?? 1, background),
    ),
    ...check(
      'foreground vs foreground/90',
      foreground,
      over(foreground, 0.9, background),
    ),
    ...check(
      'secondary vs a foreground/20 border',
      secondary,
      over(foreground, 0.2, secondary),
    ),
  ];
}

// `top` at `alpha` over `bottom`, as `bg-foreground/90` renders.
function over(top: Color, alpha: number, bottom: Color): Color {
  const a = rgb(toCulori(top));
  const b = rgb(toCulori(bottom));
  const mixed = oklch({
    b: a.b * alpha + b.b * (1 - alpha),
    g: a.g * alpha + b.g * (1 - alpha),
    mode: 'rgb',
    r: a.r * alpha + b.r * (1 - alpha),
  });
  return { components: [mixed.l, mixed.c, mixed.h ?? null], space: 'oklch' };
}

function pairFailures(theme: Theme): string[] {
  return distinctPairs.flatMap(([from, to]) =>
    check(`${from} vs ${to}`, token(theme, from), token(theme, to)),
  );
}

function resolved(familyId: string, flavor: string, primary: string): Theme {
  const family = Object.values(families).find(({ id }) => id === familyId);
  if (family === undefined) throw new Error(`no family ${familyId}`);
  const theme = resolveTheme(family, flavor, primary);
  if (Array.isArray(theme)) throw new Error(theme.join('\n'));
  return theme;
}

function toCulori(color: Color): Oklch {
  const [l, c, h] = color.components;
  return h === null ? { c, l, mode: 'oklch' } : { c, h, l, mode: 'oklch' };
}

function token(theme: Theme, role: Role): Color {
  const color = theme.tokens[role];
  if (color === undefined) throw new Error(`missing ${role}`);
  return color;
}

describe('hover changes stay visible', () => {
  it.each(themes)('%s %s with a %s primary', (familyId, flavor, primary) => {
    expect(pairFailures(resolved(familyId, flavor, primary))).toEqual([]);
  });

  it.each(themes)(
    'neutral on %s %s with a %s primary',
    (familyId, flavor, primary) => {
      expect(neutralFailures(resolved(familyId, flavor, primary))).toEqual([]);
    },
  );
});
