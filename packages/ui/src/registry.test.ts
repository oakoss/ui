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

// TypeScript's scanner also finds side-effect, type-only and multi-line imports.
function importsOf(path: string): string[] {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  return ts
    .preProcessFile(source, true, true)
    .importedFiles.map(({ fileName }) => fileName);
}

function packageName(specifier: string): string {
  const [first = '', second = ''] = specifier.split('/', 2);
  return first.startsWith('@') ? `${first}/${second}` : first;
}

const shipped = ui.items.flatMap(({ dependencies, files, name }) => {
  if (files === undefined) return [];
  const paths = files.map((file) => file.path);
  const imports = paths.flatMap((path) => importsOf(path));
  const listed = new Set(dependencies);
  const unlistedFiles = imports
    .filter((specifier) => specifier.startsWith('#/'))
    .map((specifier) => `src/${specifier.slice(2)}`)
    .filter((path) => paths.every((file) => !file.startsWith(`${path}.`)));
  const unlistedPackages = imports
    .filter((specifier) => !specifier.startsWith('#/'))
    .map((specifier) => packageName(specifier))
    .filter((pkg) => !provided.has(pkg) && !listed.has(pkg));
  return [{ name, unlistedFiles, unlistedPackages }];
});

describe.each(shipped)('$name', ({ unlistedFiles, unlistedPackages }) => {
  test('lists every local file it imports', () => {
    expect(unlistedFiles).toEqual([]);
  });

  test('lists every package it imports as a dependency', () => {
    expect(unlistedPackages).toEqual([]);
  });
});
