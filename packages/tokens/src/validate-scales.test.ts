import { describe, expect, it } from 'vitest';

import type { Family } from '#/family';
import type { AuthoredScale } from '#/scale';

import { oklch } from '#/color';
import { tailwindScales } from '#/families/tailwind-scales';
import { resolveFlavor } from '#/resolve';
import { base, dark, withFlavors, withScale } from '#/testing';
import { validateFamily } from '#/validate';

const { red, yellow } = tailwindScales;

describe('validateFamily: overrides across flavors', () => {
  it('treats an explicit undefined override as no override', () => {
    const family = withFlavors({
      dark: {
        ...dark,
        palette: { neutrals: { white: undefined }, scales: { red: undefined } },
      },
    });
    expect(validateFamily(family)).toEqual([]);
    expect(resolveFlavor(family, 'dark')).toMatchObject({
      palette: { scales: { red } },
    });
  });

  it('reports a replaced scale under each flavor that inherits it', () => {
    const bad = { ...red, foreground: oklch(120, 0, null) };
    const family = withFlavors({
      dark: { ...dark, palette: { scales: { red: bad } } },
      dim: { extends: 'dark', name: 'Dim', polarity: 'dark', roles: {} },
    });
    expect(validateFamily(family)).toEqual([
      `flavor "dark": scale "red" foreground: invalid color`,
      `flavor "dim": scale "red" foreground: invalid color`,
    ]);
  });
});

describe('validateFamily: flavor palette changes', () => {
  it('reports an invalid neutral in a flavor', () => {
    const neutrals = { white: oklch(120, 0, null) };
    const family = withFlavors({ dark: { ...dark, palette: { neutrals } } });
    expect(validateFamily(family)).toEqual([
      `flavor "dark": neutral "white" is an invalid color`,
    ]);
  });

  it('checks a scale a flavor replaces', () => {
    const steps = { ...red.steps, 600: oklch(99, 0.1, 27) };
    const family = withFlavors({
      dark: { ...dark, palette: { scales: { red: { ...red, steps } } } },
    });
    expect(validateFamily(family)).toEqual([
      `flavor "dark": scale "red" doesn't get darker at every step`,
    ]);
  });

  it('resolves to the flavor palette', () => {
    const white = oklch(90, 0, null);
    const family = withFlavors({
      dark: {
        ...dark,
        palette: { neutrals: { white }, scales: { red: yellow } },
      },
    });
    expect(resolveFlavor(family, 'dark')).toMatchObject({
      palette: { neutrals: { white }, scales: { red: yellow } },
    });
  });
});

describe('validateFamily: references across palettes', () => {
  it('reports a reference a flavor breaks by replacing its scale', () => {
    const neutral = {
      ...tailwindScales.neutral,
      steps: { ...tailwindScales.neutral.steps, 1000: oklch(10, 0, null) },
    };
    const family = withFlavors({
      dark: {
        ...dark,
        palette: { scales: { neutral: tailwindScales.neutral } },
      },
    });
    const scales = {
      ...family.palette.scales,
      neutral,
      red: { ...red, foreground: { ref: 'color.neutral.1000' as const } },
    };
    expect(
      validateFamily({ ...family, palette: { ...family.palette, scales } }),
    ).toEqual([
      `flavor "dark": scale "red" foreground: scale "neutral" has no step 1000`,
    ]);
  });

  it('reports a replaced scale even when its error matches the base', () => {
    const bad = { ...red, foreground: oklch(120, 0, null) };
    const family = withFlavors({
      dark: { ...dark, palette: { scales: { red: { ...bad } } } },
    });
    const scales = { ...family.palette.scales, red: bad };
    expect(
      validateFamily({ ...family, palette: { ...family.palette, scales } }),
    ).toEqual([
      `scale "red" foreground: invalid color`,
      `flavor "dark": scale "red" foreground: invalid color`,
    ]);
  });
});

describe('validateFamily: ramp charts', () => {
  it('reports a ramp intent that does not exist', () => {
    const charts = JSON.parse(
      '{ "kind": "ramp", "source": { "intent": "brand" }, "steps": [300, 500, 600, 700, 800] }',
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the type forbids this; the runtime check covers untyped data
    ) as Family['charts'];
    expect(validateFamily({ ...base, charts })).toEqual([
      `chart intent "brand" doesn't exist`,
    ]);
  });

  it('reports a ramp step its scale lacks', () => {
    const charts = {
      kind: 'ramp',
      source: { hue: 'neutral' },
      steps: [300, 500, 600, 700, 1000],
    } as const;
    expect(validateFamily({ ...base, charts })).toEqual([
      `chart step 1000 is missing from scale "neutral"`,
    ]);
  });

  it('reports a base palette error once', () => {
    const anchor = { dark: 800, light: 25 } as const;
    expect(validateFamily(withScale('red', { ...red, anchor }))).toEqual([
      `scale "red" light anchor is missing step 25`,
    ]);
  });
});

describe('validateFamily: anchors', () => {
  it('checks each mode anchor', () => {
    const anchor = { dark: 1000, light: 25 } as const;
    expect(validateFamily(withScale('red', { ...red, anchor }))).toEqual([
      `scale "red" dark anchor is missing step 1000`,
      `scale "red" light anchor is missing step 25`,
    ]);
  });

  it('reports a missing anchor from untyped data', () => {
    const { anchor: _missing, ...rest } = red;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the type requires an anchor; the runtime check covers untyped data
    const scale = rest as AuthoredScale;
    expect(validateFamily(withScale('red', scale))).toEqual([
      `scale "red" has no dark anchor`,
      `scale "red" has no light anchor`,
    ]);
  });
});

describe('validateFamily: authored scales', () => {
  it.each([
    ['gets lighter', { 600: oklch(99, 0.1, 27) }],
    ['repeats a lightness', { 600: oklch(63.7, 0.24, 27) }],
    ['has an extra step out of order', { 1000: oklch(30, 0.06, 26) }],
  ])('reports a scale that %s', (_, changes) => {
    const steps = { ...red.steps, ...changes };
    expect(validateFamily(withScale('red', { ...red, steps }))).toEqual([
      `scale "red" doesn't get darker at every step`,
    ]);
  });

  it('accepts extra steps that keep the scale in order', () => {
    const steps = {
      ...red.steps,
      1000: oklch(18, 0.06, 26),
      25: oklch(99, 0.005, 17),
    };
    const anchor = { dark: 25, light: 1000 } as const;
    const family = withScale('red', { ...red, anchor, steps });
    expect(validateFamily(family)).toEqual([]);
  });

  it('reports missing core steps from untyped data', () => {
    const { 500: _missing, ...partial } = red.steps;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the type forbids this; the runtime check covers untyped data
    const steps = partial as AuthoredScale['steps'];
    // Red is a primary choice, and the primary ramp chart reads step 500 too.
    expect(validateFamily(withScale('red', { ...red, steps }))).toEqual([
      `scale "red" is missing steps 500`,
      `chart step 500 is missing from scale "red"`,
    ]);
  });

  it('reports an invalid color that keeps the order', () => {
    const steps = { ...red.steps, 600: oklch(57.7, -0.1, 27) };
    expect(validateFamily(withScale('red', { ...red, steps }))).toEqual([
      `scale "red" has an invalid color`,
    ]);
  });
});

describe('validateFamily: seeded scales and foregrounds', () => {
  it.each([
    ['seed', { kind: 'seeded', seed: oklch(120, 0.1, 27) }],
    [
      'override',
      {
        kind: 'seeded',
        overrides: { 50: oklch(50, -1, 27) },
        seed: oklch(60, 0.1, 27),
      },
    ],
  ] as const)('reports an invalid %s', (_, scale) => {
    expect(validateFamily(withScale('red', scale))).toEqual([
      `scale "red" has an invalid color`,
    ]);
  });

  it('accepts a foreground that references a neutral', () => {
    const scale = { ...yellow, foreground: { ref: 'color.black' as const } };
    expect(validateFamily(withScale('yellow', scale))).toEqual([]);
  });

  it.each([
    [oklch(120, 0, null), 'invalid color'],
    [{ ref: 'color.ink' as const }, 'unknown neutral "ink"'],
  ])('reports a bad foreground', (foreground, message) => {
    expect(
      validateFamily(withScale('yellow', { ...yellow, foreground })),
    ).toEqual([`scale "yellow" foreground: ${message}`]);
  });
});
