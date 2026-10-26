import { describe, expect, it } from 'vitest';

import type { ColorRef } from '#/family';

import { oklch } from '#/color';
import { tailwindScales } from '#/families/tailwind-scales';
import { resolveFlavor } from '#/resolve';
import { vega } from '#/styles/vega';
import {
  base,
  dark,
  light,
  withFlavors,
  withLightRole,
  withNeutral,
  withScale,
} from '#/testing';
import { defaultTypography } from '#/typographies/default';
import { validateFamily } from '#/validate';
import { validateStyle, validateTypography } from '#/validate-axes';

const { blue } = tailwindScales;

describe('validateFamily: role references', () => {
  it('reports an unmapped role', () => {
    const { muted: _muted, ...roles } = light.roles;
    expect(validateFamily(withFlavors({ light: { ...light, roles } }))).toEqual(
      [`flavor "light" doesn't map role "muted"`],
    );
  });

  const brokenRefs: [ColorRef<string, string>['ref'], string][] = [
    ['color.neutral.55', 'unknown step "55"'],
    ['color.neutral.0950', 'unknown step "0950"'],
    ['color.neutral.1000', 'scale "neutral" has no step 1000'],
    [
      'color.neutral.950.extra',
      '"color.neutral.950.extra" is not a color path',
    ],
    ['color.azure.500', 'unknown scale "azure"'],
    ['color.paper', 'unknown neutral "paper"'],
    ['color.constructor.500', 'unknown scale "constructor"'],
  ];

  it.each(brokenRefs)('reports a broken reference %s', (ref, message) => {
    expect(validateFamily(withLightRole('muted', { ref }))).toEqual([
      `flavor "light" role "muted": ${message}`,
    ]);
  });

  it.each([1.5, -0.1, NaN])('reports alpha %s outside 0–1', (alpha) => {
    const family = withLightRole('border', { alpha, ref: 'color.white' });
    expect(validateFamily(family)).toEqual([
      `flavor "light" role "border": alpha ${alpha} is outside 0–1`,
    ]);
  });
});

describe('validateFamily: names', () => {
  it.each([
    ['dotted.name', 'contains a "."'],
    ['primary', 'is reserved for a role or intent'],
    ['background', 'is reserved for a role or intent'],
  ])('reports the name %s on a scale and a neutral', (name, message) => {
    const onScale = withScale(name, tailwindScales.red);
    const onNeutral = withNeutral(name, oklch(50, 0, null));
    expect(validateFamily(onScale)).toEqual([`name "${name}" ${message}`]);
    expect(validateFamily(onNeutral)).toEqual([`name "${name}" ${message}`]);
  });

  it('reports a credit that would end its CSS comment', () => {
    expect(validateFamily({ ...base, credit: 'MIT */ a {}' })).toEqual([
      'credit contains "*/"',
    ]);
  });
});

describe('validateFamily: default flavors', () => {
  it('reports a default flavor of the wrong polarity', () => {
    const family = { ...base, defaults: { dark: 'light', light: 'light' } };
    expect(validateFamily(family)).toEqual([
      `default dark flavor "light" is light`,
    ]);
  });

  it('reports a default flavor that does not exist', () => {
    const family = { ...base, defaults: { dark: 'midnight' } };
    expect(validateFamily(family)).toEqual([
      `default dark flavor "midnight" doesn't exist`,
    ]);
  });

  it('allows a family with no light flavor', () => {
    expect(validateFamily({ ...base, defaults: { dark: 'dark' } })).toEqual([]);
  });
});

describe('resolveFlavor and extends', () => {
  const chain = withFlavors({
    dim: {
      extends: 'dark',
      name: 'Dim',
      polarity: 'dark',
      roles: { background: { ref: 'color.neutral.900' } },
    },
    paper: {
      extends: 'dim',
      name: 'Paper',
      polarity: 'light',
      roles: { card: { ref: 'color.neutral.100' } },
    },
  });

  it('merges every link, with the requested flavor winning', () => {
    expect(validateFamily(chain)).toEqual([]);
    expect(resolveFlavor(chain, 'paper')).toMatchObject({
      polarity: 'light',
      roles: {
        background: { ref: 'color.neutral.900' },
        card: { ref: 'color.neutral.100' },
        foreground: dark.roles.foreground,
      },
    });
  });

  it('reports a flavor that extends an unknown flavor', () => {
    const family = withFlavors({
      dim: { extends: 'nope', name: 'Dim', polarity: 'dark', roles: {} },
    });
    expect(validateFamily(family)).toEqual([
      `flavor "dim" extends unknown flavor "nope"`,
    ]);
  });

  it('reports a flavor that extends itself', () => {
    const family = withFlavors({
      dark: { ...dark, extends: 'dim' },
      dim: { extends: 'dark', name: 'Dim', polarity: 'dark', roles: {} },
    });
    expect(validateFamily(family)).toContain(
      `flavor "dark" extends itself through "dark"`,
    );
  });
});

describe('validateFamily: intents and charts', () => {
  it('reports an intent default outside its choices', () => {
    const warning = { choices: ['amber'], default: 'yellow' };
    expect(
      validateFamily({ ...base, intents: { ...base.intents, warning } }),
    ).toEqual([`intent "warning" default "yellow" isn't one of its choices`]);
  });

  it('reports an intent choice with no scale', () => {
    const info = { choices: ['sky', 'azure'], default: 'sky' };
    expect(
      validateFamily({ ...base, intents: { ...base.intents, info } }),
    ).toEqual([`intent "info" choice "azure" has no scale`]);
  });

  it.each([
    {
      kind: 'categorical',
      series: [
        { hue: 'red', steps: { dark: 400, light: 600 } },
        { hue: 'red', steps: { dark: 400, light: 600 } },
        { hue: 'red', steps: { dark: 400, light: 600 } },
        { hue: 'red', steps: { dark: 400, light: 600 } },
        { hue: 'azure', steps: { dark: 400, light: 600 } },
      ],
    },
    {
      kind: 'ramp',
      source: { hue: 'azure' },
      steps: [300, 500, 600, 700, 800],
    },
  ] as const)('reports a chart hue with no scale ($kind)', (charts) => {
    expect(validateFamily({ ...base, charts })).toEqual([
      `chart hue "azure" has no scale`,
    ]);
  });
});

describe('validateFamily: categorical charts', () => {
  const blue1000 = {
    ...blue,
    steps: { ...blue.steps, 1000: oklch(20, 0.1, 265) },
  };
  const deep = { hue: 'blue', steps: { dark: 500, light: 1000 } } as const;
  const charts = {
    kind: 'categorical',
    series: [deep, deep, deep, deep, deep],
  } as const;

  it('reports a dark step the scale lacks', () => {
    const series = { hue: 'red', steps: { dark: 1000, light: 600 } } as const;
    expect(
      validateFamily({
        ...base,
        charts: {
          kind: 'categorical',
          series: [series, series, series, series, series],
        },
      }),
    ).toHaveLength(5);
  });

  it('reports a step a flavor drops when it replaces the scale', () => {
    const family = withScale('blue', blue1000);
    expect(validateFamily({ ...family, charts })).toEqual([]);
    const replaced = withFlavors({
      light: { ...light, palette: { scales: { blue } } },
    });
    expect(
      validateFamily({ ...replaced, charts, palette: family.palette }),
    ).toContain(`flavor "light": chart step 1000 is missing from scale "blue"`);
  });

  it('reports a chart step the scale lacks', () => {
    const series = { hue: 'red', steps: { dark: 400, light: 1000 } } as const;
    const charts = {
      kind: 'categorical',
      series: [series, series, series, series, series],
    } as const;
    expect(validateFamily({ ...base, charts })).toEqual(
      Array.from(
        { length: 5 },
        () => `chart step 1000 is missing from scale "red"`,
      ),
    );
  });
});

describe('validateStyle and validateTypography', () => {
  it('reports an empty style value', () => {
    const panel = { ...vega.tokens.panel, value: ' ' };
    expect(
      validateStyle({ ...vega, tokens: { ...vega.tokens, panel } }),
    ).toEqual([`style token "panel" has no value`]);
  });

  it.each([2, NaN])('reports style color alpha %s', (alpha) => {
    const field = {
      dark: { alpha, role: 'input' as const },
      light: 'transparent' as const,
    };
    expect(validateStyle({ ...vega, colors: { field } })).toEqual([
      `style color "field" alpha ${alpha} is outside 0–1`,
    ]);
  });

  it('reports an empty font role', () => {
    const fonts = { ...defaultTypography.fonts, mono: '' };
    expect(validateTypography({ ...defaultTypography, fonts })).toEqual([
      `font role "mono" is empty`,
    ]);
  });

  it('reports a text style with no size', () => {
    const scale = {
      ...defaultTypography.scale,
      sm: { lineHeight: '1.25', size: '' },
    };
    expect(validateTypography({ ...defaultTypography, scale })).toEqual([
      `text style "sm" needs a size and a line height`,
    ]);
  });
});
