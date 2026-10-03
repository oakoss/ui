import { describe, expect, it } from 'vitest';

import { contrastRatio, isOpaque } from '#/contrast';
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

describe('WCAG 2.2 AA contrast', () => {
  it.each(themes)('%s %s with a %s primary', (familyId, flavor, primary) => {
    expect(failures(familyId, flavor, primary)).toEqual([]);
  });
});
