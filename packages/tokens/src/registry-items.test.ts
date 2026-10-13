import { describe, expect, it } from 'vitest';

import { type Family } from '#/family';
import { families, styles, typographies } from '#/index';
import { familyCssVars, registryCssVars } from '#/registry';
import { type RegistryInputs, registryItems } from '#/registry-items';

// The theme item's family is deliberately not the first one listed.
const inputs: RegistryInputs = {
  families: [families.zinc, families.mauve],
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

describe('registryItems', () => {
  it('puts a theme item per family right after the theme item', () => {
    expect(names([base, theme, button])).toEqual([
      'base',
      'theme',
      'theme-zinc',
      'theme-mauve',
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

  it('replaces generated items and drops a removed family', () => {
    const stale = [
      { name: 'theme-zinc', type: 'registry:theme' },
      { name: 'theme-gone', type: 'registry:theme' },
    ];
    expect(names([stale[0], theme, stale[1], button])).toEqual([
      'theme',
      'theme-zinc',
      'theme-mauve',
      'button',
    ]);
  });

  it('keeps a hand-written item whose name starts with theme-', () => {
    const switcher = { name: 'theme-switcher', type: 'registry:ui' };
    expect(names([theme, switcher])).toContain('theme-switcher');
  });
});

describe('registryItems purity', () => {
  it('is idempotent and leaves its input alone', () => {
    const input = structuredClone([base, theme, button]);
    const before = structuredClone(input);
    const once = registryItems(input, inputs);
    expect(input).toEqual(before);
    expect(registryItems(once, inputs)).toEqual(once);
  });
});

describe('registryItems input checks', () => {
  it.each([
    ['no items', undefined, 'registry has no items'],
    ['no theme item', [button], 'registry has no "theme" item'],
    ['a nameless item', [theme, { type: 'registry:ui' }], 'item 1 has no name'],
    ['a numeric name', [theme, { name: 42 }], 'item 1 has no name'],
    ['a null item', [theme, null], 'item 1 has no name'],
    ['a string item', [theme, 'button'], 'item 1 has no name'],
    [
      'a name a family item takes',
      [theme, { name: 'theme-mauve', type: 'registry:ui' }],
      'names repeat: theme-mauve',
    ],
    ['a repeated hand-written name', [theme, button, button], 'repeat: button'],
  ])('rejects %s', (_, items, message) => {
    expect(() => registryItems(items, inputs)).toThrow(message);
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
