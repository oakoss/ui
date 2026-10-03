import { describe, expect, it } from 'vitest';

import type { Color } from '#/color';

import { colorDifference, contrastRatio, overlay } from '#/contrast';
import { families } from '#/index';
import {
  contrastMinimum,
  distinctMinimum,
  distinctPairs,
  type LayeredSurface,
  layeredSurfaces,
  type Role,
  stateLayer,
} from '#/roles';
import { resolveTheme, type Theme } from '#/theme';

const themes = Object.values(families).flatMap((family) =>
  Object.keys(family.flavors).flatMap((flavor) =>
    family.intents.primary.choices.map(
      (primary) => [family.id, flavor, primary] as const,
    ),
  ),
);

// Neutral has no role set: it tints the page and `secondary` with the
// foreground, and its solid fill hovers to the foreground at 90%.
const neutralSurfaces: readonly LayeredSurface[] = [
  ['background', 'foreground'],
  ['secondary', 'foreground'],
];

function distinct(label: string, a: Color, b: Color): string[] {
  const difference = colorDifference(a, b);
  return difference >= distinctMinimum
    ? []
    : [`${label}: ${difference.toFixed(2)} < ${distinctMinimum}`];
}

function layerFailures(theme: Theme): string[] {
  return [...layeredSurfaces, ...neutralSurfaces].flatMap(
    ([surfaceRole, textRole]) => {
      const surface = token(theme, surfaceRole);
      const text = token(theme, textRole);
      const pressed = overlay(text, stateLayer.press, surface);
      const ratio = contrastRatio(text, pressed);
      return [
        ...distinct(
          `${textRole} hover layer on ${surfaceRole}`,
          surface,
          overlay(text, stateLayer.hover, surface),
        ),
        ...(ratio >= contrastMinimum.text
          ? []
          : [
              `${textRole} on pressed ${surfaceRole}: ${ratio.toFixed(2)} < ${contrastMinimum.text}`,
            ]),
      ];
    },
  );
}

function neutralFillFailures(theme: Theme): string[] {
  const foreground = token(theme, 'foreground');
  return distinct(
    'foreground vs foreground/90',
    foreground,
    overlay(foreground, 0.9, token(theme, 'background')),
  );
}

function pairFailures(theme: Theme): string[] {
  return distinctPairs.flatMap(([from, to]) =>
    distinct(`${from} vs ${to}`, token(theme, from), token(theme, to)),
  );
}

function resolved(familyId: string, flavor: string, primary: string): Theme {
  const family = Object.values(families).find(({ id }) => id === familyId);
  if (family === undefined) throw new Error(`no family ${familyId}`);
  const theme = resolveTheme(family, flavor, primary);
  if (Array.isArray(theme)) throw new Error(theme.join('\n'));
  return theme;
}

function token(theme: Theme, role: Role): Color {
  const color = theme.tokens[role];
  if (color === undefined) throw new Error(`missing ${role}`);
  return color;
}

describe('hover and press stay visible and readable', () => {
  it.each(themes)('%s %s with a %s primary', (familyId, flavor, primary) => {
    const theme = resolved(familyId, flavor, primary);
    expect([
      ...pairFailures(theme),
      ...layerFailures(theme),
      ...neutralFillFailures(theme),
    ]).toEqual([]);
  });
});
