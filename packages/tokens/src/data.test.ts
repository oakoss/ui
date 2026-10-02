import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { tailwindScales } from '#/families/tailwind-scales';
import { defineFamily, type Family } from '#/family';
import {
  allRoles,
  axes,
  chartRoleMeta,
  contrastMinimum,
  contrastPairs,
  derivedRoleMeta,
  derivedRoles,
  families,
  intentRoleMeta,
  intents,
  neutralRoleMeta,
  styles,
  typographies,
  validateFamily,
  validateStyle,
  validateTypography,
} from '#/index';
import { steps } from '#/scale';
import { defineStyle } from '#/style';

const themeCss = readFileSync(
  createRequire(import.meta.url).resolve('tailwindcss/theme.css'),
  'utf8',
);

function tailwindStep(hue: string, step: number) {
  const pattern = new RegExp(
    String.raw`--color-${hue}-${step}: oklch\(([\d.]+)% ([\d.]+) ([\d.]+|none)\)`,
    'u',
  );
  const match = pattern.exec(themeCss);
  if (match === null)
    throw new Error(`theme.css has no --color-${hue}-${step}`);
  const [, lightness = '', chroma = '', hueAngle = ''] = match;
  return [
    Number(lightness) / 100,
    Number(chroma),
    hueAngle === 'none' ? null : Number(hueAngle),
  ];
}

describe('default data', () => {
  it.each(Object.entries(families))('family %s is valid', (_, family) => {
    expect(validateFamily(family)).toEqual([]);
  });

  it.each(Object.entries(styles))('style %s is valid', (_, style) => {
    expect(validateStyle(style)).toEqual([]);
  });

  it.each(Object.entries(typographies))(
    'typography %s is valid',
    (_, typography) => {
      expect(validateTypography(typography)).toEqual([]);
    },
  );

  it('keys each registry by the entry id', () => {
    for (const registry of [families, styles, typographies]) {
      for (const [key, entry] of Object.entries(registry)) {
        expect(entry.id).toBe(key);
      }
    }
  });

  it('defaults every axis to a context it lists', () => {
    for (const axis of Object.values(axes)) {
      expect(axis.contexts).toContain(axis.default);
    }
  });
});

describe('Tailwind scales', () => {
  it.each(Object.entries(tailwindScales))(
    '%s matches tailwindcss theme.css',
    (hue, scale) => {
      for (const step of steps) {
        expect(scale.steps[step].components).toEqual(tailwindStep(hue, step));
      }
    },
  );
});

describe('roles', () => {
  it('names every role once', () => {
    expect(new Set(allRoles).size).toBe(allRoles.length);
  });

  it('checks contrast only between known roles', () => {
    const known = new Set<string>(allRoles);
    for (const pair of contrastPairs) {
      expect(known).toContain(pair.foreground);
      expect(known).toContain(pair.background);
    }
  });

  it('pins the contrast pairs and minimums', () => {
    expect({ contrastMinimum, contrastPairs }).toMatchSnapshot();
  });

  it('describes every role', () => {
    const described = new Set<string>([
      ...Object.keys(chartRoleMeta),
      ...Object.keys(derivedRoleMeta),
      ...Object.keys(neutralRoleMeta),
      ...intents,
      ...intents.flatMap((intent) =>
        Object.keys(intentRoleMeta)
          .filter((kind) => kind !== 'fill')
          .map((kind) => `${intent}-${kind}`),
      ),
    ]);
    expect(allRoles.filter((role) => !described.has(role))).toEqual([]);
  });

  it('derives roles only from known roles', () => {
    for (const target of Object.values(derivedRoles)) {
      expect(allRoles).toContain(target);
    }
  });
});

describe('compile-time checks', () => {
  const red = { choices: ['red'], default: 'red' } as const;

  it('rejects family references outside the palette', () => {
    const family = defineFamily({
      charts: {
        kind: 'ramp',
        // @ts-expect-error -- `blue` isn't a scale in this family's palette
        source: { hue: 'blue' },
        steps: [300, 500, 600, 700, 800],
      },
      // @ts-expect-error -- `light` isn't one of this family's flavors
      defaults: { dark: 'dark', light: 'light' },
      flavors: {
        dark: {
          // @ts-expect-error -- `dim` isn't one of this family's flavors
          extends: 'dim',
          name: 'Dark',
          polarity: 'dark',
          // @ts-expect-error -- `teal` isn't a scale in this family's palette
          roles: { background: { ref: 'color.teal.950' } },
        },
      },
      id: 'typed',
      intents: {
        destructive: red,
        info: red,
        // @ts-expect-error -- `blue` isn't a scale in this family's palette
        primary: { choices: ['blue'], default: 'blue' },
        success: red,
        warning: red,
      },
      name: 'Typed',
      palette: { neutrals: {}, scales: { red: tailwindScales.red } },
    });
    expect(family.id).toBe('typed');
  });
});

describe('compile-time style checks', () => {
  it('allows a line height only on text tokens', () => {
    const style = defineStyle({
      colors: { field: { dark: 'transparent', light: 'transparent' } },
      id: 'typed',
      name: 'Typed',
      tokens: {
        // @ts-expect-error -- spacing tokens take no line height
        gap: {
          description: '',
          lineHeight: '1',
          namespace: 'spacing',
          value: '1rem',
        },
      },
    });
    expect(style.id).toBe('typed');
  });
});

describe('compile-time chart checks', () => {
  it('rejects a ramp that names both a hue and an intent', () => {
    const charts: Family<'red'>['charts'] = {
      kind: 'ramp',
      // @ts-expect-error -- a ramp comes from one hue or one intent
      source: { hue: 'red', intent: 'primary' },
      steps: [300, 500, 600, 700, 800],
    };
    expect(charts.kind).toBe('ramp');
  });
});
