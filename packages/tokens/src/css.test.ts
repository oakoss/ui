import { describe, expect, it } from 'vitest';

import { bundleCss, primaryBlocks, primaryHues } from '#/bundle';
import { oklch } from '#/color';
import {
  formatColor,
  primaryTokenNames,
  styleDeclarations,
  themeCss,
} from '#/css';
import { tailwindScales } from '#/families/tailwind-scales';
import { families, styles, typographies } from '#/index';
import { familyCssVars, registryCssVars } from '#/registry';
import { primaryRamp } from '#/testing';

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
    expect(css).toContain('--field: oklch(0.985 0 0 / 4.5%);');
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
    expect(css).toContain('[data-family="stone"][data-family] {');
    expect(css).toContain(
      '.dark [data-family="stone"][data-family], [data-family="stone"][data-family].dark {',
    );
    expect(css).toContain('[data-primary="blue"][data-primary] {');
    expect(css).toContain(
      `--primary: ${formatColor(tailwindScales.blue.steps[700])};`,
    );
  });

  it('sets color-scheme on each family block', () => {
    expect(css).toContain(
      '[data-family="stone"][data-family] {\n  color-scheme: light;',
    );
    expect(css).toContain(
      '[data-family="stone"][data-family].dark {\n  color-scheme: dark;',
    );
  });

  it('puts primary blocks after family blocks so they win a tie', () => {
    const familyBlocks = css
      .matchAll(
        /^(?:\.dark )?\[data-family="\w+"\]\[data-family\](?:, \[data-family="\w+"\]\[data-family\]\.dark)? \{$/gmu,
      )
      .toArray();
    expect(familyBlocks).toHaveLength(2 * Object.keys(families).length);
    expect(familyBlocks.at(-1)?.index).toBeLessThan(
      css.indexOf('[data-primary='),
    );
  });
});

// One for the doubled scope attribute, one per further attribute or class.
function intendedSpecificity(selector: string): number {
  const extras = [
    selector.includes('.dark'),
    selector.includes('data-family') && selector.includes('data-primary'),
  ].filter(Boolean).length;
  return 2 + extras;
}

function selectorsOf(css: string): string[] {
  return css
    .replaceAll(/\/\*[\s\S]*?\*\//gu, '')
    .matchAll(/([^{}]+)\{/gu)
    .flatMap(([, list = '']) => list.split(',').map((part) => part.trim()))
    .toArray();
}

// Counts classes, attributes and pseudo-classes, the only parts of the
// selector shapes the first test allows.
function specificity(selector: string): number {
  return selector.match(/[[.:]/gu)?.length ?? 0;
}

describe('bundleCss specificity', () => {
  const selectors = selectorsOf(bundleCss(Object.values(families), vega));
  const themeSelectors = selectorsOf(
    themeCss(families.zinc, vega, typographies.default),
  ).filter((selector) => !selector.startsWith('@'));

  it('uses only attribute and .dark selectors', () => {
    expect(selectors.length).toBeGreaterThan(0);
    expect(
      selectors.filter(
        (selector) =>
          !/^(?:\.dark )?(?:\[[\w-]+(?:='[\w-]+'|="[\w-]+")?\])+(?:\.dark)?$/u.test(
            selector,
          ),
      ),
    ).toEqual([]);
  });

  it("outranks the theme's :root and .dark", () => {
    expect(themeSelectors).toEqual([':root', '.dark']);
    expect(
      Math.min(...selectors.map((selector) => specificity(selector))),
    ).toBeGreaterThan(
      Math.max(...themeSelectors.map((selector) => specificity(selector))),
    );
  });

  it('keeps family and primary blocks level, so their order decides', () => {
    expect(
      selectors.filter(
        (selector) => specificity(selector) !== intendedSpecificity(selector),
      ),
    ).toEqual([]);
  });
});

describe('bundleCss primary coverage', () => {
  const css = bundleCss(Object.values(families), vega);

  it('gives every family a light block for each primary hue it offers', () => {
    const shared = new Set(
      css
        .matchAll(/^\[data-primary="(\w+)"\]\[data-primary\] \{$/gmu)
        .map(([, hue]) => hue),
    );
    const scoped = new Set(
      css
        .matchAll(
          /^\[data-family="(\w+)"\]\[data-primary="(\w+)"\]\[data-family\] \{$/gmu,
        )
        .map(([, family, hue]) => `${family}/${hue}`),
    );
    for (const family of Object.values(families)) {
      for (const hue of family.intents.primary.choices) {
        const covered = [shared.has(hue), scoped.has(`${family.id}/${hue}`)];
        expect(covered, `${family.id}/${hue}`).toContain(true);
      }
    }
    expect(primaryHues(Object.values(families))).toEqual(
      expect.arrayContaining([...shared]),
    );
  });

  it("scopes Catppuccin's hues, which differ from Tailwind's", () => {
    expect(css).toContain(
      '[data-family="catppuccin"][data-primary="blue"][data-family] {',
    );
    expect(css).toContain('\n[data-primary="blue"][data-primary] {');
  });
});

function withOwnBlue(anchor: { dark: 300 | 600; light: 700 | 900 }) {
  const blue = { ...tailwindScales.blue, anchor };
  return {
    ...families.zinc,
    palette: {
      ...families.zinc.palette,
      scales: { ...families.zinc.palette.scales, blue },
    },
  };
}

describe('bundleCss primary blocks', () => {
  it('shares one block among the families that agree on a hue', () => {
    const baseColors = [families.stone, families.zinc, families.mauve];
    expect(primaryBlocks(baseColors, 'blue', 'light')).toEqual([
      { declarations: expect.any(Array) },
    ]);
  });

  it('scopes a family whose hue differs only in dark mode', () => {
    const darkOnly = withOwnBlue({ dark: 300, light: 700 });
    const css = bundleCss([families.stone, families.mauve, darkOnly], vega);
    expect(css).toContain('\n[data-primary="blue"][data-primary] {');
    expect(css).toContain(
      '.dark [data-family="zinc"][data-primary="blue"][data-family], [data-family="zinc"][data-primary="blue"][data-family].dark {',
    );
    expect(css).not.toContain(
      '\n[data-family="zinc"][data-primary="blue"][data-family] {',
    );
  });

  it('scopes every family when no group of them is largest', () => {
    const blocks = primaryBlocks(
      [families.stone, withOwnBlue({ dark: 600, light: 900 })],
      'blue',
      'light',
    );
    expect(blocks.map(({ family }) => family)).toEqual(['stone', 'zinc']);
  });

  it('credits a family that names its palette', () => {
    const credited = { ...families.zinc, credit: 'Copyright (c) Someone' };
    expect(bundleCss([credited], vega)).toMatch(
      /^\/\* Generated by [^\n]+\n\/\* Zinc: Copyright \(c\) Someone \*\/\n/u,
    );
  });
});

describe('primaryTokenNames', () => {
  it('includes the scale, roles, derived roles and ramp charts', () => {
    expect(
      primaryTokenNames({ ...families.zinc, charts: primaryRamp }),
    ).toEqual(
      expect.arrayContaining([
        'primary-500',
        'primary-hover',
        'ring',
        'chart-1',
      ]),
    );
  });

  it("leaves categorical charts out, since they don't follow the primary", () => {
    expect(primaryTokenNames(families.zinc)).not.toContain('chart-1');
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

describe('familyCssVars', () => {
  it('holds literal colors per polarity and nothing from the style', () => {
    const { dark, light } = familyCssVars(families.mauve, vega);
    expect(light).toMatchObject({
      background: 'oklch(1 0 0)',
      field: 'oklch(0 0 0 / 0%)',
      primary: 'oklch(0.212 0.019 322.12)',
    });
    expect(dark).toMatchObject({
      background: 'oklch(0.145 0.008 326)',
      field: 'oklch(0.985 0 0 / 4.5%)',
    });
    expect(light).not.toHaveProperty('radius');
  });
});
