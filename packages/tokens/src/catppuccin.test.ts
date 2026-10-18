import { type ColorFormat, flavorEntries } from '@catppuccin/palette';
import { describe, expect, it } from 'vitest';

import type { Color } from '#/color';

import { bundleCss } from '#/bundle';
import { formatColor, resolved } from '#/css';
import { families, styles, typographies } from '#/index';
import { familyCssVars } from '#/registry';
import { registryItems, themeChoices, themeItem } from '#/registry-items';
import { resolveFlavor } from '#/resolve';

const { catppuccin } = families;
const credit = 'Copyright (c) 2021 Catppuccin, MIT License';
const css = bundleCss(Object.values(families), styles.vega);

function blockPrimary(selector: string): string | undefined {
  return new RegExp(
    String.raw`^${RegExp.escape(selector)} \{[^}]*?--primary: ([^;]+);`,
    'mu',
  ).exec(css)?.[1];
}

function published({ oklch: { c, h, l } }: ColorFormat): Color {
  return { components: [l, c, h], space: 'oklch' };
}

function resolvedPrimary(hue: string): string {
  const { primary } = resolved(catppuccin, 'light', hue);
  if (primary === undefined) throw new Error('no primary');
  return formatColor(primary);
}

function stepComponents(flavorId: string, hue: string) {
  const flavor = resolveFlavor(catppuccin, flavorId);
  if (typeof flavor === 'string') throw new Error(flavor);
  return Object.values(flavor.palette.scales[hue]?.steps ?? {}).map(
    (step) => step.components,
  );
}

const accents = flavorEntries.flatMap(([id, flavor]) =>
  flavor.colorEntries
    .filter(([, color]) => color.accent)
    .map(([name, color]) => [id, name, color] as const),
);

const pages = flavorEntries.map(
  ([id, flavor]) =>
    [id, flavor.dark ? 'dark' : 'light', flavor.colors.base] as const,
);

const extraDarkFlavors = flavorEntries
  .filter(([id, flavor]) => flavor.dark && id !== catppuccin.defaults.dark)
  .map(([id, flavor]) => [id, flavor.colors.base] as const);

describe('Catppuccin choices', () => {
  it('offers every accent as a primary', () => {
    const names = new Set(accents.map(([, name]) => name));
    expect(names.size).toBe(14);
    expect(new Set(catppuccin.intents.primary.choices)).toEqual(names);
  });

  it('defaults to Latte, Mocha and the planned intents', () => {
    expect(catppuccin.defaults).toEqual({ dark: 'mocha', light: 'latte' });
    expect(
      Object.fromEntries(
        Object.entries(catppuccin.intents).map(([intent, choice]) => [
          intent,
          choice.default,
        ]),
      ),
    ).toEqual({
      destructive: 'red',
      info: 'teal',
      primary: 'mauve',
      success: 'green',
      warning: 'yellow',
    });
  });

  it('pins the role map', () => {
    expect(
      Object.fromEntries(
        Object.entries(catppuccin.flavors).map(([id, { roles }]) => [
          id,
          roles,
        ]),
      ),
    ).toMatchSnapshot();
  });
});

describe('Catppuccin colors', () => {
  it.each(accents)(
    '%s keeps %s at one step of its scale',
    (id, name, color) => {
      expect(stepComponents(id, name)).toContainEqual(
        published(color).components,
      );
    },
  );

  it.each(pages)('%s puts the %s page on its base', (id, polarity, base) => {
    expect(resolved(catppuccin, polarity, undefined, id).background).toEqual(
      published(base),
    );
  });

  it("scopes its blue primary to its own palette's values", () => {
    const scoped = blockPrimary(
      '[data-family="catppuccin"][data-primary="blue"]',
    );
    expect(scoped).toBe(resolvedPrimary('blue'));
    expect(scoped).not.toBe(blockPrimary('[data-primary="blue"]'));
  });

  it('refuses a flavor of the other polarity', () => {
    expect(() => resolved(catppuccin, 'dark', undefined, 'latte')).toThrow(
      'flavor "latte" isn\'t dark',
    );
    expect(() => resolved(catppuccin, 'dark', undefined, 'nope')).toThrow(
      'flavor "nope" doesn\'t exist',
    );
  });
});

describe('Catppuccin flavor items', () => {
  const items = registryItems([{ name: 'theme', type: 'registry:theme' }], {
    families: [catppuccin],
    family: catppuccin,
    style: styles.vega,
    typography: typographies.default,
  });

  it.each(extraDarkFlavors)(
    'theme-catppuccin-%s uses its flavor',
    (id, base) => {
      const { dark } = familyCssVars(catppuccin, styles.vega, undefined, id);
      expect(dark.background).toBe(formatColor(published(base)));
      expect(
        items.find(({ name }) => name === `theme-catppuccin-${id}`),
      ).toMatchObject({ cssVars: { dark } });
    },
  );
});

describe('Catppuccin credit', () => {
  it('credits the palette in themes.css and every theme item', () => {
    expect(css).toContain(`/* Catppuccin: ${credit} */`);
    const descriptions = themeChoices([catppuccin]).map(
      (choice) => themeItem(choice, styles.vega).description,
    );
    expect(descriptions).toHaveLength(56);
    expect(descriptions.filter((text) => !text.includes(credit))).toEqual([]);
  });
});
