import { describe, expect, it } from 'vitest';

import type { Family } from '#/family';

import { families, styles, typographies } from '#/index';
import { familyCssVars, registryCssVars } from '#/registry';
import {
  radii,
  type RegistryInputs,
  registryItems,
  themeChoices,
  themeItem,
  themeSlug,
} from '#/registry-items';

// The theme item's family is deliberately neither first nor last.
const inputs: RegistryInputs = {
  families: [families.zinc, families.mauve, families.stone],
  family: families.mauve,
  style: styles.vega,
  typography: typographies.default,
};

// Frozen, so a registryItems that writes to its input throws in every test.
const base = Object.freeze({ name: 'base', type: 'registry:base' });
const theme = Object.freeze({ name: 'theme', type: 'registry:theme' });
const button = Object.freeze({ name: 'button', type: 'registry:ui' });

function names(items: unknown, overrides: Partial<RegistryInputs> = {}) {
  return registryItems(items, { ...inputs, ...overrides }).map(
    ({ name }) => name,
  );
}

describe('registryItems flavor items', () => {
  const dim = {
    ...families.zinc.flavors.dark,
    name: 'Dim',
    roles: {
      ...families.zinc.flavors.dark.roles,
      background: { ref: 'color.zinc.900' },
    },
  } as const;
  const zinc: Family = {
    ...families.zinc,
    credit: 'Copyright (c) Someone',
    flavors: { ...families.zinc.flavors, dim },
  };

  it('adds an item per extra dark flavor, paired with the default light', () => {
    const items = registryItems([theme], { ...inputs, families: [zinc] });
    expect(items.map(({ name }) => name)).toEqual([
      'theme',
      'theme-zinc',
      'theme-zinc-dim',
    ]);
    const dimVars = familyCssVars(zinc, styles.vega, undefined, 'dim');
    const mainVars = familyCssVars(zinc, styles.vega);
    expect(items.at(2)?.cssVars).toEqual(dimVars);
    expect(dimVars.light).toEqual(mainVars.light);
    expect(dimVars.dark.background).not.toBe(mainVars.dark.background);
    expect(items.at(2)?.description).toBe(
      "The Zinc theme family's colors, with Dim in dark mode. Zinc colors: Copyright (c) Someone",
    );
  });
});

describe('registryItems', () => {
  it('puts a theme item per family right after the theme item', () => {
    expect(names([base, theme, button])).toEqual([
      'base',
      'theme',
      'theme-zinc',
      'theme-mauve',
      'theme-stone',
      'button',
    ]);
  });

  it("fills the theme item from its family and each family's item", () => {
    const [themeItem, zinc] = registryItems([theme], inputs);
    expect(themeItem?.cssVars).toEqual(
      registryCssVars(families.mauve, styles.vega, typographies.default),
    );
    expect(zinc).toEqual({
      cssVars: familyCssVars(families.zinc, styles.vega),
      description: "The Zinc theme family's colors, light and dark.",
      name: 'theme-zinc',
      registryDependencies: ['oakoss/ui/theme'],
      title: 'Zinc theme',
      type: 'registry:theme',
    });
  });

  it('replaces generated items wherever they sit', () => {
    const stale = { name: 'theme-zinc', type: 'registry:theme' };
    expect(names([stale, theme, button])).toEqual([
      'theme',
      'theme-zinc',
      'theme-mauve',
      'theme-stone',
      'button',
    ]);
  });

  it('keeps a hand-written item whose name starts with theme-', () => {
    const switcher = { name: 'theme-switcher', type: 'registry:ui' };
    expect(names([theme, switcher])).toContain('theme-switcher');
  });
});

describe('registryItems output', () => {
  it('orders family item keys like the hand-written items', () => {
    const zinc = registryItems([theme], inputs).at(1);
    expect(Object.keys({ ...zinc })).toEqual([
      'name',
      'type',
      'title',
      'description',
      'registryDependencies',
      'cssVars',
    ]);
  });

  it('is idempotent and leaves its input alone', () => {
    const input = structuredClone([base, theme, button]);
    const before = structuredClone(input);
    const once = registryItems(input, inputs);
    expect(input).toEqual(before);
    expect(registryItems(once, inputs)).toEqual(once);
  });
});

describe('registryItems item checks', () => {
  it.each([
    ['no items', undefined, 'registry has no items array'],
    ['an items object', {}, 'registry has no items array'],
    ['a null item', [theme, null], "item 1 isn't an object"],
    ['a string item', [theme, 'button'], "item 1 isn't an object"],
    ['an array item', [theme, ['button']], "item 1 isn't an object"],
    ['a nameless item', [theme, { type: 'registry:ui' }], 'item 1 has no name'],
    ['a numeric name', [theme, { name: 42 }], 'item 1 has no name'],
    ['an empty name', [theme, { name: '' }], `name "" isn't kebab-case`],
    ['a capitalized name', [theme, { name: 'Button' }], "isn't kebab-case"],
    ['a snake_case name', [theme, { name: 'my_item' }], "isn't kebab-case"],
    ['a hyphen-only name', [theme, { name: '-' }], `name "-" isn't kebab-case`],
    [
      'a trailing hyphen',
      [theme, { name: 'a-' }],
      `name "a-" isn't kebab-case`,
    ],
    ['a leading hyphen', [theme, { name: '-a' }], `name "-a" isn't kebab-case`],
    ['a double hyphen', [theme, { name: 'a--b' }], `"a--b" isn't kebab-case`],
  ])('rejects %s', (_, items, message) => {
    expect(() => registryItems(items, inputs)).toThrow(message);
  });
});

describe('registryItems theme checks', () => {
  it.each([
    ['no theme item', [button], 'registry has no "theme" item'],
    [
      'an untyped theme item',
      [{ name: 'theme' }],
      `the "theme" item isn't a registry:theme`,
    ],
    [
      'a theme item of another type',
      [{ name: 'theme', type: 'registry:ui' }],
      `the "theme" item isn't a registry:theme`,
    ],
    [
      'a second theme item',
      [theme, { name: 'theme', type: 'registry:ui' }],
      'more than one "theme" item',
    ],
    [
      'a second registry:theme theme item',
      [theme, { ...theme }],
      'more than one "theme" item',
    ],
    [
      'a registry:theme item that matches no family',
      [theme, { name: 'dark-mode', type: 'registry:theme' }],
      'registry:theme items match no family: dark-mode;',
    ],
    [
      'registry:theme items that match no family',
      [
        theme,
        { name: 'dark-mode', type: 'registry:theme' },
        { name: 'theme-gone', type: 'registry:theme' },
        { name: 'themes', type: 'registry:theme' },
      ],
      'registry:theme items match no family: dark-mode, theme-gone, themes',
    ],
    [
      'a name a family item takes',
      [theme, { name: 'theme-mauve', type: 'registry:ui' }],
      'names repeat: theme-mauve',
    ],
    ['a repeated hand-written name', [theme, button, button], 'repeat: button'],
  ])('rejects %s', (_, items, message) => {
    expect(() => registryItems(items, inputs)).toThrow(message);
  });
});

describe('themeItem', () => {
  const [none, , medium] = radii;

  it('sets the chosen primary and radius over the family item', () => {
    const item = themeItem(
      { family: families.mauve, primary: 'red', radius: none },
      styles.vega,
    );
    const red = familyCssVars(families.mauve, styles.vega, 'red');
    expect(item).toEqual({
      cssVars: { dark: red.dark, light: { radius: '0rem', ...red.light } },
      description: 'The Mauve theme family with a red primary and none radius.',
      name: 'theme-mauve-red-none',
      registryDependencies: ['oakoss/ui/theme'],
      title: 'Mauve theme, red primary',
      type: 'registry:theme',
    });
    const gray = familyCssVars(families.mauve, styles.vega);
    expect(red.light.primary).not.toEqual(gray.light.primary);
    expect(red.dark.primary).not.toEqual(gray.dark.primary);
  });

  it("matches the family item for the family's defaults", () => {
    const { cssVars } = themeItem(
      { family: families.zinc, primary: 'zinc', radius: medium },
      styles.vega,
    );
    expect(cssVars).toEqual({
      ...familyCssVars(families.zinc, styles.vega),
      light: {
        radius: styles.vega.tokens.radius.value,
        ...familyCssVars(families.zinc, styles.vega).light,
      },
    });
  });

  it("rejects a primary the family doesn't offer", () => {
    expect(() =>
      themeItem(
        { family: families.mauve, primary: 'plaid', radius: none },
        styles.vega,
      ),
    ).toThrow(`primary "plaid" isn't one of its choices`);
  });
});

describe('themeChoices', () => {
  it('writes item JSON in the registry key order', () => {
    const choice = { family: families.zinc, primary: 'zinc', radius: radii[0] };
    expect(JSON.stringify(themeItem(choice, styles.vega))).toMatch(
      /^\{"name":.*,"type":.*,"title":.*,"description":.*,"registryDependencies":.*,"cssVars":/u,
    );
  });

  it('builds every choice under a unique name', () => {
    const choices = themeChoices(Object.values(families));
    const perFamily = Object.values(families).map(
      (family) => family.intents.primary.choices.length * radii.length,
    );
    expect(choices).toHaveLength(perFamily.reduce((a, b) => a + b));
    expect(new Set(choices.map((choice) => themeSlug(choice))).size).toBe(
      choices.length,
    );
  });
});

describe('registryItems family checks', () => {
  it.each(['gray2', 'mist-gray'])('accepts the family id "%s"', (id) => {
    const family: Family = { ...families.mauve, id };
    expect(names([theme], { families: [family] })).toContain(`theme-${id}`);
  });

  it('rejects two families with one id', () => {
    const twin: Family = { ...families.mauve, id: 'zinc' };
    expect(() =>
      registryItems([theme], { ...inputs, families: [families.zinc, twin] }),
    ).toThrow('names repeat: theme-zinc');
  });

  it.each(['Mist Gray', 'Mist', 'mist_gray', 'mist.gray'])(
    'rejects the family id "%s"',
    (id) => {
      const family: Family = { ...families.mauve, id };
      expect(() => names([theme], { families: [family] })).toThrow(
        `family id "${id}" isn't a registry item name`,
      );
    },
  );
});
