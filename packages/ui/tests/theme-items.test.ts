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

// The generator owns every registry:theme item but `theme`.
const familyItems = ui.items.filter(
  ({ name, type }) => type === 'registry:theme' && name !== 'theme',
);

test('every theme family in themes.css has a theme item', () => {
  const ids = new Set(
    Array.from(
      themesCss.matchAll(/\[data-family=['"]([\w-]+)['"]\]/gu),
      ([, id]) => id,
    ),
  );
  expect(ids.size).toBeGreaterThan(0);
  expect(new Set(familyItems.map(({ name }) => name))).toEqual(
    new Set([...ids].map((id) => `theme-${id}`)),
  );
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
describe.each(familyItems)('$name', (item) => {
  const scope = `[data-family='${item.name.slice('theme-'.length)}']`;

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

  // themes.css comes from the runtime bundle, a separate code path.
  test("matches the family's runtime bundle in themes.css", () => {
    expect(item.cssVars?.light).toEqual(themesRules.get(scope));
    expect(item.cssVars?.dark).toEqual(
      themesRules.get(`.dark ${scope}, ${scope}.dark`),
    );
  });
});
