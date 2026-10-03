import { describe, expect, it } from 'vitest';

import { oklch } from '#/color';
import { tailwindScales } from '#/families/tailwind-scales';
import { families } from '#/index';
import { withLightRole, withScale } from '#/testing';
import { resolveTheme, type Theme } from '#/theme';

const { blue, red, zinc } = tailwindScales;
const seeded = { kind: 'seeded', seed: oklch(60, 0.2, 250) } as const;

function errorsOf(result: string[] | Theme): string[] {
  return Array.isArray(result) ? result : [];
}

function theme(result: string[] | Theme): Theme {
  if (Array.isArray(result)) throw new Error(result.join('\n'));
  return result;
}

describe('resolveTheme', () => {
  it('resolves the default Zinc light theme', () => {
    const { polarity, tokens } = theme(resolveTheme(families.zinc, 'light'));
    expect(polarity).toBe('light');
    expect(tokens).toMatchObject({
      background: { components: [1, 0, null] },
      'chart-1': zinc.steps[300],
      'chart-5': zinc.steps[800],
      destructive: red.steps[700],
      primary: zinc.steps[900],
      'primary-500': zinc.steps[500],
      'primary-foreground': zinc.steps[50],
      ring: zinc.steps[600],
      'sidebar-primary': zinc.steps[900],
    });
  });

  it('swaps the primary scale and everything that follows it', () => {
    const { tokens } = theme(resolveTheme(families.zinc, 'dark', 'blue'));
    expect(tokens).toMatchObject({
      'chart-1': blue.steps[300],
      destructive: red.steps[700],
      primary: blue.steps[600],
      'primary-hover': blue.steps[700],
      'primary-text': blue.steps[400],
      ring: blue.steps[400],
      'sidebar-primary-foreground': blue.steps[50],
    });
  });

  it('keeps alpha from a role reference', () => {
    const { tokens } = theme(resolveTheme(families.zinc, 'dark'));
    expect(tokens.border).toEqual({
      alpha: 0.1,
      components: [1, 0, null],
      space: 'oklch',
    });
  });
});

describe('resolveTheme across families', () => {
  it('resolves every family, flavor and primary choice', () => {
    const failures = Object.values(families).flatMap((family) =>
      Object.keys(family.flavors).flatMap((flavor) =>
        family.intents.primary.choices.flatMap((hue) =>
          errorsOf(resolveTheme(family, flavor, hue)),
        ),
      ),
    );
    expect(failures).toEqual([]);
  });

  it('rejects a primary outside the family choices', () => {
    expect(resolveTheme(families.zinc, 'light', 'stone')).toEqual([
      `flavor "light": primary "stone" isn't one of its choices`,
    ]);
  });

  it('returns validation errors instead of resolving', () => {
    const family = withLightRole('background', { ref: 'color.nope' });
    expect(resolveTheme(family, 'light')).toEqual([
      `flavor "light" role "background": unknown neutral "nope"`,
    ]);
  });
});

describe('resolveTheme errors for valid but ungenerated data', () => {
  it.each([
    [
      'a seeded intent hue',
      withScale('blue', seeded),
      'blue',
      'primary (blue): no authored scale',
    ],
    [
      'a role reference into a seeded scale',
      {
        ...withScale('brand', seeded),
        flavors: withLightRole('accent', { ref: 'color.brand.100' }).flavors,
      },
      undefined,
      `role "accent": scale "brand" is seeded, which isn't generated yet`,
    ],
    [
      'a hand-written foreground',
      withScale('red', { ...red, foreground: oklch(0, 0, null) }),
      undefined,
      "destructive (red): hand-written foregrounds aren't generated yet",
    ],
    [
      'a translucent background',
      withLightRole('background', { alpha: 0.5, ref: 'color.white' }),
      undefined,
      'role "background" is translucent',
    ],
  ] as const)('reports %s', (_, family, primary, error) => {
    expect(resolveTheme(family, 'light', primary)).toEqual([
      `flavor "light": ${error}`,
    ]);
  });

  it('reports a flavor id that only exists on the prototype', () => {
    expect(resolveTheme(families.zinc, 'constructor')).toEqual([
      `flavor "constructor" doesn't exist`,
    ]);
  });
});
