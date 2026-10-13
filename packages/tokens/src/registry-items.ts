import type { Family } from '#/family';
import type { Style } from '#/style';
import type { Typography } from '#/typography';

import { familyCssVars, registryCssVars } from '#/registry';

export type RegistryInputs = {
  families: readonly Family[];
  // The `theme` item's family; it gets a `theme-<id>` item only if listed.
  family: Family;
  style: Style;
  typography: Typography;
};

type Item = { name: string } & Record<string, unknown>;

/**
`registry.json`'s items with the generated ones replaced: the `theme`
item's cssVars and a `theme-<family>` item per family, right after it.
*/
export function registryItems(
  items: unknown,
  { families, family, style, typography }: RegistryInputs,
): Item[] {
  const checked = namedItems(items);
  const theme = checked.find((item) => item.name === 'theme');
  if (theme === undefined) throw new Error('registry has no "theme" item');
  theme.cssVars = registryCssVars(family, style, typography);

  const familyNames = families.map((entry) => familyItemName(entry));
  const familyItems = families.map((entry, index) =>
    familyItem(entry, familyNames[index], style),
  );

  // Every registry:theme item but `theme` is generated, so a removed family
  // loses its item while hand-written items keep theirs.
  const kept = checked.filter(
    (item) => item === theme || item.type !== 'registry:theme',
  );
  const names = [...kept.map((item) => item.name), ...familyNames];
  const repeated = names.filter((name, index) => names.indexOf(name) !== index);
  if (repeated.length > 0) {
    throw new Error(`registry item names repeat: ${repeated.join(', ')}`);
  }
  const index = kept.indexOf(theme) + 1;
  return [...kept.slice(0, index), ...familyItems, ...kept.slice(index)];
}

// Entries, not a literal lint would sort, so the JSON reads name first like
// the hand-written items.
function familyItem(entry: Family, name: string | undefined, style: Style) {
  return Object.fromEntries([
    ['name', name],
    ['type', 'registry:theme'],
    ['title', `${entry.name} theme`],
    ['description', `The ${entry.name} theme family's colors, light and dark.`],
    ['registryDependencies', ['oakoss/ui/theme']],
    ['cssVars', familyCssVars(entry, style)],
  ]);
}

function familyItemName(entry: Family): string {
  if (!/^[a-z\d-]+$/u.test(entry.id)) {
    throw new Error(`family id "${entry.id}" isn't a registry item name`);
  }
  return `theme-${entry.id}`;
}

function namedItems(items: unknown): Item[] {
  if (!Array.isArray(items)) throw new Error('registry has no items');
  return items.map((item: unknown, index): Item => {
    if (
      typeof item !== 'object' ||
      item === null ||
      Array.isArray(item) ||
      !('name' in item) ||
      typeof item.name !== 'string'
    ) {
      throw new Error(`registry item ${index} has no name`);
    }
    return { ...item, name: item.name };
  });
}
