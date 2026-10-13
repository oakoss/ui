import { readFileSync, writeFileSync } from 'node:fs';

import { bundleCss } from '#/bundle';
import { cnConfigModule, cnTheme } from '#/cn-config';
import { themeCss } from '#/css';
import { axes, families, styles, typographies } from '#/index';
import { registryItems } from '#/registry-items';

const ui = new URL('../../ui/', import.meta.url);
const family = families[axes.family.default];
const style = styles[axes.style.default];
const typography = typographies[axes.typography.default];

const registryUrl = new URL('registry.json', ui);
const registry: unknown = JSON.parse(readFileSync(registryUrl, 'utf-8'));
if (
  typeof registry !== 'object' ||
  registry === null ||
  Array.isArray(registry)
) {
  throw new Error("registry.json isn't a JSON object");
}
const items = registryItems('items' in registry ? registry.items : undefined, {
  families: Object.values(families),
  family,
  style,
  typography,
});

// Everything builds before anything is written, so a build failure leaves no
// partial output.
const files = [
  ['src/styles/theme.css', `${themeCss(family, style, typography)}\n`],
  ['src/styles/themes.css', `${bundleCss(Object.values(families), style)}\n`],
  [
    'src/lib/cn-config.ts',
    cnConfigModule(cnTheme(Object.values(styles), Object.values(typographies))),
  ],
  ['registry.json', `${JSON.stringify({ ...registry, items }, null, 2)}\n`],
] as const;
for (const [path, content] of files) writeFileSync(new URL(path, ui), content);
