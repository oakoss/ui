import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

import root from '../../../registry.json';
import ui from '../registry.json';
import { forked } from './forked';

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

// Each port's base: React Aria's, except Table's Radix one (docs/research/0002).
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

// From an import path or a dependency that pins a range (`pkg@^9`).
function packageName(specifier: string): string {
  const [first = '', second = ''] = specifier.split('/', 2);
  const name = first.startsWith('@') ? `${first}/${second}` : first;
  return name.replace(/(?<=.)@.*/u, '');
}

const shipped = ui.items.flatMap(({ dependencies, files, name }) => {
  if (files === undefined) return [];
  const paths = files.map((file) => file.path);
  const installed = installedPaths(name);
  const imports = paths.flatMap((path) => importsOf(path));
  const listed = new Set(dependencies?.map((dep) => packageName(dep)));
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

// No field import needs Input; the dependency installs it for code using both.
test('field keeps installing Input', () => {
  const field = ui.items.find(({ name }) => name === 'field');
  expect(field?.registryDependencies).toContain('oakoss/ui/input');
});

// Tailwind drops the plugin's pressed:/pending: variants without it; shadcn
// merges the theme's css and devDependencies into every install.
test('the theme installs the React Aria Tailwind plugin', () => {
  const theme = ui.items.find(({ name }) => name === 'theme');
  expect(theme).toMatchObject({
    css: { '@plugin tailwindcss-react-aria-components': {} },
    devDependencies: ['tailwindcss-react-aria-components'],
  });
});

// Only init writes `config` (apply takes no GitHub registry address), and
// without `extends: none` init also installs shadcn's own style. shadcn
// rewrites icons to the library's imports but installs no package for it.
test('the base item sets the icon library and installs the theme', () => {
  const base = ui.items.find(({ name }) => name === 'base');
  expect(base).toMatchObject({
    config: { iconLibrary: 'lucide' },
    dependencies: ['lucide-react'],
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

// An item's CSS as shadcn 4.21.4 writes it: variants on top, the rest @theme inline.
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
      : `@theme inline{${variables}${stylesheet(Object.fromEntries(themed))}}`;
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

// Longest folder first, so ui/ wins over components/.
const aliases = [
  ['src/components/ui/', '@ui/'],
  ['src/components/', '@components/'],
  ['src/hooks/', '@hooks/'],
  ['src/lib/', '@lib/'],
] as const;

function aliasedTarget(path: string) {
  const alias = aliases.find(([folder]) => path.startsWith(folder));
  return alias && `${alias[1]}${path.slice(alias[0].length)}`;
}

const misplaced = ui.items.flatMap(({ files = [] }) =>
  files
    .filter(({ target }) => target.startsWith('@'))
    .filter(({ path, target }) => target !== aliasedTarget(path))
    .map(({ path }) => path),
);

// The same-name check reads paths, and shadcn installs at targets.
test('each aliased target is the path under its alias', () => {
  expect(misplaced).toEqual([]);
});

const registryPaths = [
  ...new Set(
    ui.items.flatMap(({ files = [] }) => files.map(({ path }) => path)),
  ),
];
const stems = registryPaths.map((path) =>
  path.replace(/^.*\//u, '').replace(/\.[^.]+$/u, ''),
);
const sameNamed = registryPaths.filter(
  (_, index) => stems.indexOf(stems.at(index) ?? '') !== index,
);

// shadcn 4.21.4 rewrites an import by file name across every item one `add`
// installs, named or not, so lib/toast/toast became the toast component's own
// path. Any two items can be added together.
test('no two files in the registry share a name', () => {
  expect(sameNamed).toEqual([]);
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
