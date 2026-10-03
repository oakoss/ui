import type { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

import * as hugeicons from '@hugeicons/core-free-icons';
import * as phosphor from '@phosphor-icons/react';
import * as remixicon from '@remixicon/react';
import * as tabler from '@tabler/icons-react';
import * as lucide from 'lucide-react';
import { readFileSync } from 'node:fs';
import { transformIcons } from 'shadcn/utils';
import { Project, type SourceFile, SyntaxKind } from 'ts-morph';
import { describe, expect, test } from 'vitest';

import {
  type IconLibrary,
  IconPlaceholder,
  type IconProps,
} from '#/components/icon-placeholder';
import * as icons from '#/components/icons';

const packages: Record<IconLibrary, object> = {
  hugeicons,
  lucide,
  phosphor,
  remixicon,
  tabler,
};
const libraries = [
  'hugeicons',
  'lucide',
  'phosphor',
  'remixicon',
  'tabler',
] as const satisfies readonly IconLibrary[];

function importedNames(source: string): Set<string> {
  return new Set(
    source
      .matchAll(/import\s*\{(?<names>[^}]*)\}/gu)
      .flatMap(({ groups }) => (groups?.names ?? '').split(','))
      .map((name) => name.trim()),
  );
}

const entries = Object.entries(icons).map(([key, Icon]) => {
  const element = Icon({});
  const props: Record<string, unknown> = element.props;
  const names = Object.fromEntries(
    Object.keys(packages).map((library) => [library, props[library]]),
  );
  const missing = Object.entries(packages).flatMap(([library, exports]) => {
    const name = names[library];
    return typeof name === 'string' && Object.hasOwn(exports, name)
      ? []
      : [library];
  });
  return { element, Icon, key, missing, names };
});

test('every key is PascalCase', () => {
  expect(
    entries
      .map(({ key }) => key)
      .filter((key) => !/^[A-Z][A-Za-z0-9]*$/u.test(key)),
  ).toEqual([]);
});

describe.each(entries)('$key', ({ element, Icon, missing }) => {
  test('is an IconPlaceholder', () => {
    expect(element.type).toBe(IconPlaceholder);
  });

  test('names an existing icon in every library', () => {
    expect(missing).toEqual([]);
  });

  test('passes props through', () => {
    expect(
      Icon({ 'aria-label': 'probe', className: 'probe' }).props,
    ).toMatchObject({ 'aria-label': 'probe', className: 'probe' });
  });
});

const source = readFileSync(new URL('icons.tsx', import.meta.url), 'utf-8');

// A local named like an imported icon renders itself instead of the icon.
function declaredNames(sourceFile: SourceFile): string[] {
  return [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ClassDeclaration),
  ].flatMap((node) => node.getName() ?? []);
}

async function installed(library: IconLibrary): Promise<SourceFile> {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('icons.tsx', source);
  // transformIcons reads only config.iconLibrary.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a partial shadcn config
  const config = { iconLibrary: library } as Parameters<
    typeof transformIcons
  >[0]['config'];
  await transformIcons({
    config,
    filename: 'icons.tsx',
    raw: source,
    sourceFile,
  });
  return sourceFile;
}

// Run shadcn's own install-time transform, as `shadcn add` would.
describe.each(libraries)('installed with iconLibrary %s', (library) => {
  test('replaces every IconPlaceholder and imports each icon', async () => {
    const sourceFile = await installed(library);
    const output = sourceFile.getFullText();
    expect(output).not.toMatch(/<IconPlaceholder\b/u);
    const imported = importedNames(output);
    const wanted = entries.map(({ names }) => String(names[library]));
    expect(wanted.filter((name) => !imported.has(name))).toEqual([]);
  });

  test('declares nothing named like an imported icon', async () => {
    const sourceFile = await installed(library);
    const imported = importedNames(sourceFile.getFullText());
    expect(
      declaredNames(sourceFile).filter((name) => imported.has(name)),
    ).toEqual([]);
  });
});

// Checked by typecheck: each assignment fails if an installed icon would
// reject the props the map spreads onto it.
test('IconProps spreads onto every library icon', () => {
  const props: IconProps = {};
  const spreads: [
    ComponentProps<typeof lucide.CheckIcon>,
    ComponentProps<typeof tabler.IconCheck>,
    ComponentProps<typeof phosphor.CheckIcon>,
    ComponentProps<typeof remixicon.RiCheckLine>,
    Omit<ComponentProps<typeof HugeiconsIcon>, 'icon'>,
  ] = [props, props, props, props, props];
  expect(spreads).toHaveLength(5);
});
