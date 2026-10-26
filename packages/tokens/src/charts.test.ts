import { describe, expect, it } from 'vitest';

import { colorBlindDifference, contrastRatio, isOpaque } from '#/contrast';
import { families } from '#/index';
import {
  chartDistinctMinimum,
  chartRoles,
  contrastMinimum,
  type Role,
} from '#/roles';
import { resolveTheme, type Theme } from '#/theme';

// Marks sit on the page and on the panels a chart can be placed in.
const surfaces: readonly Role[] = ['background', 'card', 'popover', 'muted'];

const themes = Object.values(families).flatMap((family) =>
  Object.keys(family.flavors).flatMap((flavor) =>
    family.intents.primary.choices.map(
      (primary) => [family.id, flavor, primary] as const,
    ),
  ),
);

function chartColor(theme: Theme, role: string) {
  const color = theme.tokens[role];
  if (color === undefined) throw new Error(`${role} missing`);
  return color;
}

function contrastFailures(theme: Theme): string[] {
  const opaque = surfaces.filter((surface) => {
    const color = theme.tokens[surface];
    return color !== undefined && isOpaque(color);
  });
  return chartRoles.flatMap((role) =>
    opaque
      .map((surface) => ({
        ratio: contrastRatio(
          chartColor(theme, role),
          chartColor(theme, surface),
        ),
        surface,
      }))
      .filter(({ ratio }) => ratio < contrastMinimum['non-text'])
      .map(
        ({ ratio, surface }) => `${role} on ${surface}: ${ratio.toFixed(2)}`,
      ),
  );
}

function distinctFailures(theme: Theme): string[] {
  return chartRoles.flatMap((role, index) =>
    chartRoles
      .slice(index + 1)
      .map((other) => ({
        difference: colorBlindDifference(
          chartColor(theme, role),
          chartColor(theme, other),
        ),
        other,
      }))
      .filter(({ difference }) => difference < chartDistinctMinimum)
      .map(
        ({ difference, other }) =>
          `${role} and ${other}: ${difference.toFixed(1)}`,
      ),
  );
}

function resolved(familyId: string, flavor: string, primary: string): Theme {
  const family = Object.values(families).find(({ id }) => id === familyId);
  if (family === undefined) throw new Error(`no family ${familyId}`);
  const theme = resolveTheme(family, flavor, primary);
  if (Array.isArray(theme)) throw new Error(theme.join('\n'));
  return theme;
}

describe('chart colors', () => {
  it.each(themes)(
    'reach 3:1 on every surface (%s %s, primary %s)',
    (familyId, flavor, primary) => {
      expect(contrastFailures(resolved(familyId, flavor, primary))).toEqual([]);
    },
  );

  it.each(themes)(
    'stay apart under simulated color blindness (%s %s, primary %s)',
    (familyId, flavor, primary) => {
      expect(distinctFailures(resolved(familyId, flavor, primary))).toEqual([]);
    },
  );
});
