import { describe, expect, it } from 'vitest';

import type { AuthoredScale } from '#/scale';

import { oklch } from '#/color';
import { tailwindScales } from '#/families/tailwind-scales';
import { dark, untyped, withFlavors, withScale } from '#/testing';
import { validateFamily } from '#/validate';

const { red } = tailwindScales;
const seed = oklch(60, 0.1, 27);

describe('validateFamily: seeded scale references', () => {
  it.each([
    [
      'without an override',
      undefined,
      [`flavor "dark" role "accent": scale "brand" has no step 25`],
    ],
    ['with an override', { 25: oklch(99, 0.01, 27) }, []],
  ] as const)('checks a reference to step 25 %s', (_, overrides, errors) => {
    const family = {
      ...withScale('brand', { kind: 'seeded', overrides, seed }),
      flavors: withFlavors({
        dark: {
          ...dark,
          roles: { ...dark.roles, accent: { ref: 'color.brand.25' } },
        },
      }).flavors,
    };
    expect(validateFamily(family)).toEqual(errors);
  });

  // The base palette pass sees the seeded scale before any flavor expands it.
  it.each([
    [undefined, [`scale "red" foreground: scale "brand" has no step 25`]],
    [{ 25: oklch(99, 0.01, 27) }, []],
  ] as const)(
    'checks a foreground reference to step 25',
    (overrides, errors) => {
      const brand = { kind: 'seeded' as const, overrides, seed };
      const foreground = { ref: 'color.brand.25' as const };
      const family = withScale('red', { ...red, foreground });
      const scales = { ...family.palette.scales, brand };
      expect(
        validateFamily({ ...family, palette: { ...family.palette, scales } }),
      ).toEqual(errors);
    },
  );
});

describe('validateFamily: seeded scale errors are reported once', () => {
  it('reports a ramp step a seeded scale lacks', () => {
    const charts = {
      kind: 'ramp',
      source: { hue: 'brand' },
      steps: [300, 500, 600, 700, 25],
    } as const;
    const family = withScale('brand', { kind: 'seeded', seed });
    expect(validateFamily({ ...family, charts })).toEqual([
      `chart step 25 is missing from scale "brand"`,
    ]);
  });

  it('reports a reference error, not once per flavor', () => {
    const brand = {
      foreground: { ref: 'color.nope.500' as const },
      kind: 'seeded' as const,
      seed,
    };
    expect(validateFamily(withScale('brand', brand))).toEqual([
      `scale "brand" foreground: unknown scale "nope"`,
    ]);
  });
});

describe('validateFamily: seeded scale colors', () => {
  it.each([
    ['an override out of order', { 200: oklch(20, 0.05, 27) }],
    ['an override on the seed step', { 600: oklch(95, 0.05, 27) }],
    ['a step 25 darker than 50', { 25: oklch(10, 0.05, 27) }],
  ] as const)('reports %s', (_, overrides) => {
    const scale = { kind: 'seeded' as const, overrides, seed };
    expect(validateFamily(withScale('brand', scale))).toEqual([
      `scale "brand" doesn't get darker at every step`,
    ]);
  });

  it('accepts an explicit undefined override', () => {
    const scale = {
      kind: 'seeded' as const,
      overrides: { 300: undefined },
      seed,
    };
    expect(validateFamily(withScale('brand', scale))).toEqual([]);
  });

  it('reports infinite chroma instead of hanging', () => {
    const scale = { kind: 'seeded' as const, seed: oklch(60, Infinity, 27) };
    expect(validateFamily(withScale('brand', scale))).toEqual([
      `scale "brand" has an invalid color`,
    ]);
  });

  it('accepts a gray seed with no hue', () => {
    const scale = { kind: 'seeded' as const, seed: oklch(60, 0, null) };
    expect(validateFamily(withScale('brand', scale))).toEqual([]);
  });

  it('reports a seed with chroma but no hue', () => {
    const scale = { kind: 'seeded' as const, seed: oklch(60, 0.1, null) };
    expect(validateFamily(withScale('brand', scale))).toEqual([
      `scale "brand" seed has chroma but no hue`,
    ]);
  });

  it('reports an unknown scale kind', () => {
    const scale = untyped<AuthoredScale>({ ...red, kind: 'mystery' });
    expect(validateFamily(withScale('brand', scale))).toEqual([
      `scale "brand" has unknown kind "mystery"`,
    ]);
  });
});
