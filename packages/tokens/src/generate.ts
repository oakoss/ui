import { readFileSync, writeFileSync } from 'node:fs';

import { bundleCss } from '#/bundle';
import { cnConfigModule, cnTheme } from '#/cn-config';
import { themeCss } from '#/css';
import { axes, families, styles, typographies } from '#/index';
import { registryCssVars } from '#/registry';

const ui = new URL('../../ui/', import.meta.url);
const family = families[axes.family.default];
const style = styles[axes.style.default];
const typography = typographies[axes.typography.default];

writeFileSync(
  new URL('src/styles/theme.css', ui),
  `${themeCss(family, style, typography)}\n`,
);
writeFileSync(
  new URL('src/styles/themes.css', ui),
  `${bundleCss(Object.values(families), style)}\n`,
);
const cnThemeNames = cnTheme(
  Object.values(styles),
  Object.values(typographies),
);
writeFileSync(
  new URL('src/lib/cn-config.ts', ui),
  cnConfigModule(cnThemeNames),
);

const registryUrl = new URL('registry.json', ui);
const registry: unknown = JSON.parse(readFileSync(registryUrl, 'utf-8'));
const items: unknown =
  typeof registry === 'object' && registry !== null && 'items' in registry
    ? registry.items
    : undefined;
const theme = Array.isArray(items)
  ? items.find(
      (item: unknown): item is Record<string, unknown> =>
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        item.name === 'theme',
    )
  : undefined;
if (theme === undefined) throw new Error('registry has no "theme" item');
theme.cssVars = registryCssVars(family, style, typography);
writeFileSync(registryUrl, `${JSON.stringify(registry, null, 2)}\n`);
