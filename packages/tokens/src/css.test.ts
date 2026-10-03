import { describe, expect, it } from 'vitest';

import { bundleCss, primaryHues } from '#/bundle';
import { oklch } from '#/color';
import {
  formatColor,
  primaryTokenNames,
  styleDeclarations,
  themeCss,
} from '#/css';
import { tailwindScales } from '#/families/tailwind-scales';
import { families, styles, typographies } from '#/index';
import { registryCssVars } from '#/registry';

const { vega } = styles;

describe('formatColor', () => {
  it.each([
    [oklch(100, 0, null), 'oklch(1 0 0)'],
    [oklch(14.1, 0.005, 285.823), 'oklch(0.141 0.005 285.823)'],
    [oklch(100, 0, null, 0.1), 'oklch(1 0 0 / 10%)'],
    [oklch(100, 0, null, 0.045), 'oklch(1 0 0 / 4.5%)'],
  ])('formats %j', (color, css) => {
    expect(formatColor(color)).toBe(css);
  });
});

describe('styleDeclarations', () => {
  it('drops a namespace suffix and puts plain tokens on the root', () => {
    const { root, theme } = styleDeclarations(vega);
    expect(root).toContainEqual(['--radius', '0.625rem']);
    expect(theme).toEqual(
      expect.arrayContaining([
        ['--spacing-control', '2.25rem'],
        ['--radius-control', 'var(--radius-md)'],
        ['--text-ui', '0.875rem'],
        ['--text-ui--line-height', 'calc(1.25 / 0.875)'],
      ]),
    );
  });
});

describe('themeCss', () => {
  const css = themeCss(families.zinc, vega, typographies.default);

  it('declares both modes, the bridges and the radius scale', () => {
    expect(css).toContain(':root {\n  color-scheme: light;');
    expect(css).toContain('.dark {\n  color-scheme: dark;');
    expect(css).toContain('--primary: oklch(0.21 0.006 285.885);');
    expect(css).toContain('--color-primary: var(--primary);');
    expect(css).toContain('--radius-md: calc(var(--radius) * 0.8);');
    expect(css).toContain('--field: oklch(1 0 0 / 4.5%);');
    expect(css).toContain('--z-modal: 1300;');
  });

  it('keeps style and type tokens in a plain @theme', () => {
    const plain = css.slice(css.indexOf('@theme {'));
    expect(plain).toContain('--spacing-control: 2.25rem;');
    expect(plain).toContain('--font-heading:');
    expect(plain).toContain('--text-sm--line-height: calc(1.25 / 0.875);');
    expect(plain).not.toContain('--color-');
  });
});

describe('bundleCss', () => {
  const css = bundleCss(Object.values(families), vega);

  it('scopes each family and primary hue in both modes', () => {
    expect(css).toContain('[data-family="stone"] {');
    expect(css).toContain(
      '.dark [data-family="stone"], [data-family="stone"].dark {',
    );
    expect(css).toContain('[data-primary="blue"] {');
    expect(css).toContain(
      `--primary: ${formatColor(tailwindScales.blue.steps[700])};`,
    );
  });

  it('sets color-scheme on each family block', () => {
    expect(css).toContain('[data-family="stone"] {\n  color-scheme: light;');
    expect(css).toContain(
      '[data-family="stone"].dark {\n  color-scheme: dark;',
    );
  });

  it('puts primary blocks after family blocks so they win a tie', () => {
    expect(css.lastIndexOf('[data-family=')).toBeLessThan(
      css.indexOf('[data-primary='),
    );
  });

  it('scopes exactly the primary hues, once each, every family offering them', () => {
    const hues = primaryHues(Object.values(families));
    const scoped = css
      .matchAll(/^\[data-primary="(\w+)"\] \{$/gmu)
      .map(([, hue]) => hue)
      .toArray();
    expect(scoped).toEqual(hues);
    expect(new Set(hues).size).toBe(hues.length);
    for (const family of Object.values(families)) {
      expect(hues).toEqual(
        expect.arrayContaining([...family.intents.primary.choices]),
      );
    }
  });
});

describe('bundleCss axis independence', () => {
  it('rejects a primary hue that differs only in dark mode', () => {
    const blue = {
      ...tailwindScales.blue,
      anchor: { dark: 300, light: 700 },
    } as const;
    const darkOnly = {
      ...families.zinc,
      palette: {
        ...families.zinc.palette,
        scales: { ...families.zinc.palette.scales, blue },
      },
    };
    expect(() =>
      bundleCss([families.stone, families.mauve, darkOnly], vega),
    ).toThrow('primary "blue" (dark) differs in family "zinc"');
  });

  it('rejects a primary hue that differs between families', () => {
    const blue = {
      ...tailwindScales.blue,
      anchor: { dark: 600, light: 900 },
    } as const;
    const zinc = {
      ...families.zinc,
      palette: {
        ...families.zinc.palette,
        scales: { ...families.zinc.palette.scales, blue },
      },
    };
    expect(() => bundleCss([families.stone, zinc], vega)).toThrow(
      'primary "blue" (light) differs in family "zinc"',
    );
  });
});

describe('primaryTokenNames', () => {
  it('includes the scale, roles, derived roles and ramp charts', () => {
    expect(primaryTokenNames(families.zinc)).toEqual(
      expect.arrayContaining([
        'primary-500',
        'primary-hover',
        'ring',
        'chart-1',
      ]),
    );
  });
});

describe('registryCssVars', () => {
  it('uses literal colors so shadcn bridges them', () => {
    const vars = registryCssVars(families.zinc, vega, typographies.default);
    expect(vars.light.primary).toBe('oklch(0.21 0.006 285.885)');
    expect(vars.light.radius).toBe('0.625rem');
    expect(vars.light['ring-width']).toBeUndefined();
    expect(vars.light.field).toBe('oklch(0 0 0 / 0%)');
    expect(vars.theme).toMatchObject({
      'ring-width': '3px',
      'spacing-control': '2.25rem',
      'z-modal': '1300',
    });
    expect(
      Object.values(vars.dark).every((value) => value.startsWith('oklch')),
    ).toBe(true);
  });
});
