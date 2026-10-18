import { isDeepStrictEqual } from 'node:util';
import { describe, expect, it } from 'vitest';

import type { Family } from '#/family';

import { type Color, oklch } from '#/color';
import { tailwindScales } from '#/families/tailwind-scales';
import { families } from '#/index';
import { resolveFlavor } from '#/resolve';
import { isStep } from '#/scale';
import { expandSeeded } from '#/seeded';
import { withLightRole, withScale } from '#/testing';
import { resolveTheme, type Theme } from '#/theme';

const { blue, red, zinc } = tailwindScales;
const seeded = { kind: 'seeded', seed: oklch(60, 0.2, 250) } as const;

function errorsOf(result: string[] | Theme): string[] {
  return Array.isArray(result) ? result : [];
}

// Writes past the readonly types, as untyped code can.
function overwrite(target: object | undefined, change: object) {
  if (target === undefined) throw new Error('nothing to overwrite');
  Object.assign(target, change);
}

function referenced(
  family: Family,
  flavor: string,
  path: string,
): Color | undefined {
  const resolved = resolveFlavor(family, flavor);
  if (typeof resolved === 'string') throw new Error(resolved);
  const [, name = '', step] = path.split('.', 3);
  if (step === undefined) return resolved.palette.neutrals[name];
  const number = Number(step);
  return isStep(number)
    ? resolved.palette.scales[name]?.steps[number]
    : undefined;
}

// The color a token's recorded source points at, following derived roles.
function sourceColor(
  family: Family,
  flavor: string,
  sources: Theme['sources'],
  name: string,
): Color | undefined {
  let source = sources[name];
  while (source !== undefined && 'role' in source)
    source = sources[source.role];
  if (source === undefined) return undefined;
  const color = referenced(family, flavor, source.ref);
  return color === undefined || source.alpha === undefined
    ? color
    : { ...color, alpha: source.alpha };
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

describe('resolveTheme copies', () => {
  // A caller changing a returned theme mustn't change the family data the
  // next resolve reads.
  it('returns colors and sources the family data does not share', () => {
    const first = theme(resolveTheme(families.zinc, 'light'));
    const before = structuredClone(first);
    overwrite(first.tokens.background, { alpha: 0 });
    // A new hue keeps the scale valid, so only the comparison can catch it.
    overwrite(first.tokens.foreground?.components, { 2: 10 });
    overwrite(first.tokens['primary-500'], { alpha: 0 });
    overwrite(first.tokens['primary-600']?.components, { 2: 10 });
    overwrite(first.sources.background, { ref: 'color.black' });
    const next = theme(resolveTheme(families.zinc, 'light'));
    expect(next).toEqual(before);
  });
});

describe('resolveTheme sources', () => {
  it('records where each token comes from', () => {
    const { sources } = theme(resolveTheme(families.zinc, 'light'));
    expect(sources).toMatchObject({
      background: { ref: 'color.white' },
      'chart-1': { ref: 'color.zinc.300' },
      primary: { ref: 'color.zinc.900' },
      'primary-500': { ref: 'color.zinc.500' },
      'primary-foreground': { ref: 'color.zinc.50' },
      ring: { role: 'primary-text' },
      'sidebar-primary': { role: 'primary' },
    });
  });

  it('records the picked steps of the chosen primary', () => {
    const { sources } = theme(resolveTheme(families.zinc, 'dark', 'blue'));
    expect(sources).toMatchObject({
      border: { alpha: 0.1, ref: 'color.white' },
      'chart-1': { ref: 'color.blue.300' },
      primary: { ref: 'color.blue.600' },
      'primary-hover': { ref: 'color.blue.700' },
      'primary-text': { ref: 'color.blue.400' },
    });
  });

  // A source has to resolve to the token's own color, or the docs show a
  // primitive the theme doesn't use.
  it('gives every token a source that resolves to its color', () => {
    const mismatches = Object.values(families).flatMap((family) =>
      Object.keys(family.flavors).flatMap((flavor) =>
        family.intents.primary.choices.flatMap((hue) => {
          const resolved = theme(resolveTheme(family, flavor, hue));
          return Object.keys(resolved.tokens)
            .filter(
              (name) =>
                !isDeepStrictEqual(
                  sourceColor(family, flavor, resolved.sources, name),
                  resolved.tokens[name],
                ),
            )
            .map((name) => `${family.id} ${flavor} ${hue}: ${name}`);
        }),
      ),
    );
    expect(mismatches).toEqual([]);
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

describe('resolveTheme with a seeded scale', () => {
  it('fills an intent from the expanded scale', () => {
    const { tokens } = theme(
      resolveTheme(withScale('blue', seeded), 'light', 'blue'),
    );
    // Lightness 0.6 is nearest Tailwind's 600.
    expect(tokens['primary-600']).toEqual(seeded.seed);
    expect(tokens.primary).toBeDefined();
  });

  it('resolves a role reference into the expanded scale', () => {
    const family = {
      ...withScale('brand', seeded),
      flavors: withLightRole('accent', { ref: 'color.brand.100' }).flavors,
    };
    const { tokens } = theme(resolveTheme(family, 'light'));
    expect(tokens.accent).toEqual(
      expandSeeded<string, string>(seeded).steps[100],
    );
  });
});

describe('resolveTheme errors for valid but ungenerated data', () => {
  it.each([
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
