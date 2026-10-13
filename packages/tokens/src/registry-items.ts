import type { Family } from '#/family';
import type { Style } from '#/style';
import type { Typography } from '#/typography';

import { type CssVars, familyCssVars, registryCssVars } from '#/registry';

export type Radius = (typeof radii)[number];

export type RegistryInputs = {
  families: readonly Family[];
  // The `theme` item's family; it gets a `theme-<id>` item only if listed.
  family: Family;
  style: Style;
  typography: Typography;
};

export type ThemeChoice = { family: Family; primary: string; radius: Radius };

export type ThemeItem = {
  cssVars: Pick<CssVars, 'dark' | 'light'>;
  description: string;
  name: string;
  registryDependencies: string[];
  title: string;
  type: 'registry:theme';
};

type Item = { name: string } & Record<string, unknown>;

const kebabCase = /^[a-z\d]+(?:-[a-z\d]+)*$/u;

// shadcn's /create presets.
export const radii = [
  { name: 'none', value: '0rem' },
  { name: 'small', value: '0.45rem' },
  { name: 'medium', value: '0.625rem' },
  { name: 'large', value: '0.875rem' },
] as const;

/**
`registry.json`'s items with the generated ones replaced: the `theme`
item's cssVars and a `theme-<family>` item per family, right after it.
*/
export function registryItems(
  items: unknown,
  { families, family, style, typography }: RegistryInputs,
): Item[] {
  const checked = namedItems(items);
  const themes = checked.filter((item) => item.name === 'theme');
  if (themes.length > 1) {
    throw new Error('registry has more than one "theme" item');
  }
  const [theme] = themes;
  if (theme === undefined) throw new Error('registry has no "theme" item');
  if (theme.type !== 'registry:theme') {
    throw new Error('the "theme" item isn\'t a registry:theme');
  }
  theme.cssVars = registryCssVars(family, style, typography);

  const familyItems = families.map((entry) => familyItem(entry, style));
  const familyNames = new Set(familyItems.map((item) => item.name));
  // Every registry:theme item but `theme` is a generated family item.
  const generated = checked.filter(
    (item) => item !== theme && item.type === 'registry:theme',
  );
  const stray = generated.filter((item) => !familyNames.has(item.name));
  if (stray.length > 0) {
    const names = stray.map((item) => item.name).join(', ');
    throw new Error(
      `registry:theme items match no family: ${names}; delete them or add the family`,
    );
  }
  const kept = checked.filter((item) => !generated.includes(item));
  const names = [...kept, ...familyItems].map((item) => item.name);
  const repeated = names.filter((name, index) => names.indexOf(name) !== index);
  if (repeated.length > 0) {
    throw new Error(`registry item names repeat: ${repeated.join(', ')}`);
  }

  const index = kept.indexOf(theme) + 1;
  return [...kept.slice(0, index), ...familyItems, ...kept.slice(index)];
}

/**
Every family, primary and radius combination, for theme items built outside
the registry.
*/
export function themeChoices(families: readonly Family[]): ThemeChoice[] {
  return families.flatMap((family) =>
    family.intents.primary.choices.flatMap((primary) =>
      radii.map((radius) => ({ family, primary, radius })),
    ),
  );
}

/**
A `theme-<family>` item with a primary and radius chosen. It sets `radius`
in `light`, the slot shadcn writes to `:root`.
*/
export function themeItem(choice: ThemeChoice, style: Style): ThemeItem {
  const { family, primary, radius } = choice;
  const { dark, light } = familyCssVars(family, style, primary);
  const name = `theme-${themeSlug(choice)}`;
  if (!kebabCase.test(name)) {
    throw new Error(`theme item name "${name}" isn't kebab-case`);
  }
  return themeRegistryItem({
    cssVars: { dark, light: { radius: radius.value, ...light } },
    description: `The ${family.name} theme family with a ${primary} primary and ${radius.name} radius.`,
    name,
    title: `${family.name} theme, ${primary} primary`,
  });
}

export function themeSlug({ family, primary, radius }: ThemeChoice): string {
  return `${family.id}-${primary}-${radius.name}`;
}

function familyItem(entry: Family, style: Style): ThemeItem {
  if (!kebabCase.test(entry.id)) {
    throw new Error(`family id "${entry.id}" isn't a registry item name`);
  }
  return themeRegistryItem({
    cssVars: familyCssVars(entry, style),
    description: `The ${entry.name} theme family's colors, light and dark.`,
    name: `theme-${entry.id}`,
    title: `${entry.name} theme`,
  });
}

function namedItems(items: unknown): Item[] {
  if (!Array.isArray(items)) throw new Error('registry has no items array');
  return items.map((item: unknown, index): Item => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`registry item ${index} isn't an object`);
    }
    if (!('name' in item) || typeof item.name !== 'string') {
      throw new Error(`registry item ${index} has no name`);
    }
    if (!kebabCase.test(item.name)) {
      throw new Error(`registry item name "${item.name}" isn't kebab-case`);
    }
    return { ...item, name: item.name };
  });
}

/**
A theme item that depends on the `theme` item, keyed in the JSON order of
the hand-written items. Lint sorts object literals, so each key is assigned
on its own, nested because `Object.assign` with more than three sources
returns `any` and the return type would check nothing.
*/
function themeRegistryItem({
  cssVars,
  description,
  name,
  title,
}: Pick<ThemeItem, 'cssVars' | 'description' | 'name' | 'title'>): ThemeItem {
  return Object.assign(
    Object.assign({ name }, { type: 'registry:theme' as const }, { title }),
    { description },
    { registryDependencies: ['oakoss/ui/theme'] },
    { cssVars },
  );
}
