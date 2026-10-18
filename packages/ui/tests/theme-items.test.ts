import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import ui from '../registry.json';

const themesCss = readFileSync(
  new URL('../src/styles/themes.css', import.meta.url),
  'utf-8',
).replaceAll(/\/\*[\s\S]*?\*\//gu, '');

// Keyed by selector list, whitespace collapsed and quotes normalized to '.
const themesRules = new Map(
  Array.from(
    themesCss.matchAll(/([^{}]+)\{([^{}]*)\}/gu),
    ([, selector = '', body = '']) => [
      selector.replaceAll(/\s+/gu, ' ').replaceAll('"', "'").trim(),
      Object.fromEntries(
        Array.from(
          body.matchAll(/--([\w-]+):\s*([^;]+);/gu),
          ([, name, value]) => [name, value],
        ),
      ),
    ],
  ),
);

const familyIds = new Set(
  themesRules
    .keys()
    .flatMap(
      (selector) =>
        /^\[data-family='([\w-]+)'\]\[data-family\]$/u
          .exec(selector)
          ?.slice(1) ?? [],
    ),
);

// The generator owns every registry:theme item but `theme`: one per family
// in themes.css, and one per extra dark flavor, which themes.css lacks.
const generatedItems = ui.items.filter(
  ({ name, type }) => type === 'registry:theme' && name !== 'theme',
);
const familyItems = generatedItems.filter(({ name }) =>
  familyIds.has(name.slice('theme-'.length)),
);
const flavorItems = generatedItems.filter(
  (item) => !familyItems.includes(item),
);

function familyOf(name: string): string | undefined {
  return [...familyIds].find((family) => name.startsWith(`theme-${family}-`));
}

test('every theme family in themes.css has a theme item', () => {
  expect(familyIds.size).toBeGreaterThan(0);
  expect(new Set(familyItems.map(({ name }) => name))).toEqual(
    new Set([...familyIds].map((id) => `theme-${id}`)),
  );
});

test('every other generated theme item is a flavor of a family', () => {
  expect(
    flavorItems
      .map(({ name }) => name)
      .filter((name) => familyOf(name) === undefined),
    'items whose family has no block in themes.css',
  ).toEqual([]);
  expect(flavorItems.map(({ name }) => familyOf(name))).toContain('catppuccin');
});

const theme = ui.items.find(({ name }) => name === 'theme');

function keysOf(vars: object | undefined): string[] {
  if (vars === undefined) throw new Error('missing cssVars');
  return Object.keys(vars);
}

function themeColorNames(polarity: 'dark' | 'light'): string[] {
  const vars = theme?.cssVars?.[polarity];
  if (vars === undefined) throw new Error(`the theme item has no ${polarity}`);
  return Object.keys(vars).filter((name) => name !== 'radius');
}

// A family item installs the theme first and overrides its colors; a color it
// lacked would keep the theme's value and mix two families.
describe.each(generatedItems)('$name', (item) => {
  test('is a theme that depends on the theme item', () => {
    expect(item).toMatchObject({
      registryDependencies: ['oakoss/ui/theme'],
      type: 'registry:theme',
    });
  });

  test("overrides every one of the theme's colors and nothing else", () => {
    expect(keysOf(item.cssVars?.light)).toEqual(themeColorNames('light'));
    expect(keysOf(item.cssVars?.dark)).toEqual(themeColorNames('dark'));
    expect(item.cssVars).not.toHaveProperty('theme');
  });
});

describe.each(familyItems)('$name', (item) => {
  const scope = `[data-family='${item.name.slice('theme-'.length)}'][data-family]`;

  // themes.css comes from the runtime bundle, a separate code path.
  test("matches the family's runtime bundle in themes.css", () => {
    expect(item.cssVars?.light).toEqual(themesRules.get(scope));
    expect(item.cssVars?.dark).toEqual(
      themesRules.get(`.dark ${scope}, ${scope}.dark`),
    );
  });
});

describe.each(flavorItems)('$name', (item) => {
  const scope = `[data-family='${familyOf(item.name) ?? ''}'][data-family]`;

  test("keeps the family's light colors and changes its dark ones", () => {
    expect(themesRules.get(scope), `no block for ${scope}`).toBeDefined();
    expect(item.cssVars?.light).toEqual(themesRules.get(scope));
    expect(item.cssVars?.dark).not.toEqual(
      themesRules.get(`.dark ${scope}, ${scope}.dark`),
    );
  });
});
