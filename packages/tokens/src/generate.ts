import { readFileSync, writeFileSync } from 'node:fs';

import { bundleCss } from '#/bundle';
import { cnConfigModule, cnTheme } from '#/cn-config';
import { themeCss } from '#/css';
import { axes, families, styles, typographies } from '#/index';
import { familyCssVars, registryCssVars } from '#/registry';

type Item = { name: string } & Record<string, unknown>;

const ui = new URL('../../ui/', import.meta.url);
const family = families[axes.family.default];
const style = styles[axes.style.default];
const typography = typographies[axes.typography.default];

const registryUrl = new URL('registry.json', ui);
const registry: unknown = JSON.parse(readFileSync(registryUrl, 'utf-8'));
if (
  typeof registry !== 'object' ||
  registry === null ||
  !('items' in registry) ||
  !Array.isArray(registry.items)
) {
  throw new Error('registry has no items');
}
const items = registry.items.map((item: unknown, index): Item => {
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

const theme = items.find((item) => item.name === 'theme');
if (theme === undefined) throw new Error('registry has no "theme" item');
theme.cssVars = registryCssVars(family, style, typography);

const familyNames = Object.values(families).map((entry) => {
  if (!/^[a-z\d-]+$/u.test(entry.id)) {
    throw new Error(`family id "${entry.id}" isn't a registry item name`);
  }
  return `theme-${entry.id}`;
});
// Entries, not a literal lint would sort, so the JSON reads name first like
// the hand-written items.
const familyItems = Object.values(families).map((entry, index) =>
  Object.fromEntries([
    ['name', familyNames[index]],
    ['type', 'registry:theme'],
    ['title', `${entry.name} theme`],
    ['description', `The ${entry.name} theme family's colors, light and dark.`],
    ['registryDependencies', ['oakoss/ui/theme']],
    ['cssVars', familyCssVars(entry, style)],
  ]),
);

// Every registry:theme item but `theme` is generated, so a removed family
// loses its item while hand-written items keep theirs.
const kept = items.filter(
  (item) => item === theme || item.type !== 'registry:theme',
);
const names = [...kept.map((item) => item.name), ...familyNames];
const repeated = names.filter((name, index) => names.indexOf(name) !== index);
if (repeated.length > 0) {
  throw new Error(`registry item names repeat: ${repeated.join(', ')}`);
}
const index = kept.indexOf(theme) + 1;
const output = [...kept.slice(0, index), ...familyItems, ...kept.slice(index)];

// Everything builds before anything is written, so a build failure leaves no
// partial output.
const files = [
  ['src/styles/theme.css', `${themeCss(family, style, typography)}\n`],
  ['src/styles/themes.css', `${bundleCss(Object.values(families), style)}\n`],
  [
    'src/lib/cn-config.ts',
    cnConfigModule(cnTheme(Object.values(styles), Object.values(typographies))),
  ],
  [
    'registry.json',
    `${JSON.stringify({ ...registry, items: output }, null, 2)}\n`,
  ],
] as const;
for (const [path, content] of files) writeFileSync(new URL(path, ui), content);
