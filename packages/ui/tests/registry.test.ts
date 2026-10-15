import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

import root from '../../../registry.json';
import ui from '../registry.json';

const addresses = new Set(ui.items.map((item) => `oakoss/ui/${item.name}`));
const deps = ui.items.flatMap((item) => item.registryDependencies ?? []);
// The consumer's app supplies these, so items don't list them.
const provided = new Set(['react', 'react-dom']);

test('the root registry includes only the files checked here', () => {
  expect(root.include).toEqual(['packages/ui/registry.json']);
});

test('registryDependencies point at items in this repo', () => {
  expect(deps.length).toBeGreaterThan(0);
  expect(deps.filter((dep) => !addresses.has(dep))).toEqual([]);
});

// Items ported from shadcn; add each new port here.
const forked = [
  'accordion',
  'alert',
  'alert-dialog',
  'avatar',
  'badge',
  'breadcrumb',
  'button',
  'button-group',
  'calendar',
  'card',
  'checkbox',
  'collapsible',
  'combobox',
  'command',
  'context-menu',
  'dialog',
  'dropdown-menu',
  'empty',
  'field',
  'hover-card',
  'input',
  'input-group',
  'item',
  'kbd',
  'native-select',
  'pagination',
  'popover',
  'progress',
  'radio-group',
  'scroll-area',
  'select',
  'separator',
  'sheet',
  'skeleton',
  'slider',
  'spinner',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toggle',
  'toggle-group',
  'tooltip',
];

// The base each port came from: React Aria's, except Table, a plain HTML
// table from the Radix base (docs/research/0002).
const bases: Record<string, string> = {
  ...Object.fromEntries(forked.map((name) => [name, 'aria'])),
  table: 'radix',
};
const upstreams = new Map(
  ui.items.map((item) => [item.name, item.meta?.upstream]),
);

const ported = ui.items
  .filter((item) => item.meta?.upstream !== undefined)
  .map((item) => item.name);

// An item that names an upstream is a port, so the check below covers it.
test('every item naming an upstream is listed as forked', () => {
  expect(ported.filter((name) => !forked.includes(name))).toEqual([]);
});

// Diffing upstream between this commit and a newer one finds fixes to port.
test.each(forked.map((name) => [name, bases[name]]))(
  '%s names the upstream commit and file it came from',
  (name, base) => {
    expect(upstreams.get(name)).toMatch(
      new RegExp(
        String.raw`^shadcn-ui/ui@[\da-f]{7,40}:apps/v4/registry/bases/${base}/ui/${name}\.tsx$`,
        'u',
      ),
    );
  },
);

// TypeScript's scanner also finds side-effect, type-only and multi-line imports.
function importsOf(path: string): string[] {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf-8');
  return ts
    .preProcessFile(source, true, true)
    .importedFiles.map(({ fileName }) => fileName);
}

// An item's own files plus every file its registry dependencies install.
function installedPaths(name: string, seen = new Set<string>()): string[] {
  if (seen.has(name)) return [];
  seen.add(name);
  const item = ui.items.find((candidate) => candidate.name === name);
  return [
    ...(item?.files ?? []).map((file) => file.path),
    ...(item?.registryDependencies ?? []).flatMap((dep) =>
      installedPaths(dep.replace('oakoss/ui/', ''), seen),
    ),
  ];
}

function packageName(specifier: string): string {
  const [first = '', second = ''] = specifier.split('/', 2);
  return first.startsWith('@') ? `${first}/${second}` : first;
}

const shipped = ui.items.flatMap(({ dependencies, files, name }) => {
  if (files === undefined) return [];
  const paths = files.map((file) => file.path);
  const installed = installedPaths(name);
  const imports = paths.flatMap((path) => importsOf(path));
  const listed = new Set(dependencies);
  const unlistedFiles = imports
    .filter((specifier) => specifier.startsWith('#/'))
    .map((specifier) => `src/${specifier.slice(2)}`)
    .filter((path) => installed.every((file) => !file.startsWith(`${path}.`)));
  const unlistedPackages = imports
    .filter((specifier) => !specifier.startsWith('#/'))
    .map((specifier) => packageName(specifier))
    .filter((pkg) => !provided.has(pkg) && !listed.has(pkg));
  return { name, unlistedFiles, unlistedPackages };
});

// No field import needs Input; the dependency keeps `add field` installing it
// for code that imports Input alongside the field parts.
test('field keeps installing Input', () => {
  const field = ui.items.find(({ name }) => name === 'field');
  expect(field?.registryDependencies).toContain('oakoss/ui/input');
});

// Components use the plugin's pressed:/pending: variants, which Tailwind
// drops without it; shadcn merges the theme's css and devDependencies into
// every install that depends on it.
test('the theme installs the React Aria Tailwind plugin', () => {
  const theme = ui.items.find(({ name }) => name === 'theme');
  expect(theme).toMatchObject({
    css: { '@plugin tailwindcss-react-aria-components': {} },
    devDependencies: ['tailwindcss-react-aria-components'],
  });
});

// Only init writes `config` (apply takes no GitHub registry address), and
// without `extends: none` init also installs shadcn's own style.
test('the base item sets the icon library and installs the theme', () => {
  const base = ui.items.find(({ name }) => name === 'base');
  expect(base).toMatchObject({
    config: { iconLibrary: 'lucide' },
    extends: 'none',
    registryDependencies: ['oakoss/ui/theme'],
    type: 'registry:base',
  });
});

// The theme item's cssVars can't carry color-scheme, so the base item does.
test('the base item sets the color-scheme theme.css sets', () => {
  const theme = readFileSync(
    new URL('../src/styles/theme.css', import.meta.url),
    'utf-8',
  );
  const scheme = (selector: string) =>
    new RegExp(`^${selector} \\{\\s*color-scheme: (\\w+);`, 'mu').exec(
      theme,
    )?.[1];
  expect(ui.items.find(({ name }) => name === 'base')).toMatchObject({
    css: {
      ':root': { 'color-scheme': scheme(':root') },
      '.dark': { 'color-scheme': scheme(String.raw`\.dark`) },
    },
  });
});

function baseLayer(): unknown {
  const base = ui.items.find(({ name }) => name === 'base');
  const css = base && 'css' in base ? base.css : undefined;
  return css && '@layer base' in css ? css['@layer base'] : undefined;
}

function minified(css: string): string {
  return css
    .replaceAll(/\/\*[\s\S]*?\*\//gu, '')
    .replaceAll(/\s*([{}:;,])\s*/gu, '$1')
    .replaceAll(/\s+/gu, ' ')
    .trim();
}

// A registry `css` object as the stylesheet text shadcn writes for it.
function stylesheet(rules: unknown): string {
  if (typeof rules !== 'object' || rules === null) return '';
  return Object.entries(rules)
    .map(([key, value]) =>
      typeof value === 'string'
        ? `${key}:${value};`
        : `${key}{${stylesheet(value)}}`,
    )
    .join('');
}

test('the base item ships base.css', () => {
  const layer = baseLayer();
  const source = readFileSync(
    new URL('../src/styles/base.css', import.meta.url),
    'utf-8',
  );
  expect(minified(stylesheet({ '@layer base': layer }))).toBe(minified(source));
});

const styled = ui.items.filter(
  (item) => item.type === 'registry:ui' && ('css' in item || 'cssVars' in item),
);

function isVariant([key]: [string, unknown]) {
  return key.startsWith('@custom-variant ');
}

// An item's CSS as shadcn 4.21.4 writes it: variants on top, the rest @theme.
function themeBlock(item: (typeof ui.items)[number]): string {
  const theme = ('cssVars' in item ? item.cssVars?.theme : undefined) ?? {};
  const variables = Object.entries(theme)
    .map(([key, value]) => `--${key}:${String(value)};`)
    .join('');
  const rules = Object.entries('css' in item ? (item.css ?? {}) : {});
  const variants = rules.filter((rule) => isVariant(rule));
  const themed = rules.filter((rule) => !isVariant(rule));
  const block =
    variables === '' && themed.length === 0
      ? ''
      : `@theme{${variables}${stylesheet(Object.fromEntries(themed))}}`;
  return `${variants.map(([key]) => `${key};`).join('')}${block}`;
}

// Storybook and the docs load the same CSS from src/styles/<item>.css.
test.each(styled.map((item) => [item.name, item] as const))(
  '%s ships its stylesheet',
  (name, item) => {
    const source = readFileSync(
      new URL(`../src/styles/${name}.css`, import.meta.url),
      'utf-8',
    );
    expect(minified(themeBlock(item))).toBe(minified(source));
  },
);

test('a component stylesheet reaches Storybook and the docs', () => {
  const globals = readFileSync(
    new URL('../src/styles/globals.css', import.meta.url),
    'utf-8',
  );
  expect(styled.length).toBeGreaterThan(0);
  for (const { name } of styled) {
    expect(globals).toContain(`@import './${name}.css';`);
  }
});

function isThemeless(item: (typeof ui.items)[number]): boolean {
  return (
    item.type === 'registry:ui' &&
    !(item.registryDependencies ?? []).includes('oakoss/ui/theme')
  );
}

test('every component depends on the theme', () => {
  expect(ui.items.filter(isThemeless).map(({ name }) => name)).toEqual([]);
});

test('item names are unique', () => {
  const names = ui.items.map(({ name }) => name);
  expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual(
    [],
  );
});

describe.each(shipped)('$name', ({ unlistedFiles, unlistedPackages }) => {
  test('lists every local file it imports', () => {
    expect(unlistedFiles).toEqual([]);
  });

  test('lists every package it imports as a dependency', () => {
    expect(unlistedPackages).toEqual([]);
  });
});
