import type { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

import * as hugeicons from '@hugeicons/core-free-icons';
import * as phosphor from '@phosphor-icons/react';
import * as remixicon from '@remixicon/react';
import * as tabler from '@tabler/icons-react';
import * as lucide from 'lucide-react';
import { readFileSync } from 'node:fs';
import { transformIcons } from 'shadcn/utils';
import {
  type ImportSpecifier,
  Node,
  Project,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { beforeAll, describe, expect, test } from 'vitest';

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

// The local name an import binds: its alias when renamed.
function boundName(named: ImportSpecifier): string {
  return (named.getAliasNode() ?? named.getNameNode()).getText();
}

// A local named like an imported icon renders itself instead of the icon.
function declaredNames(sourceFile: SourceFile): string[] {
  return [
    ...sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.BindingElement),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.Parameter),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ClassDeclaration),
    ...sourceFile.getDescendantsOfKind(SyntaxKind.ClassExpression),
  ].flatMap((node) => {
    const name = node.getNameNode();
    return Node.isIdentifier(name) ? [name.getText()] : [];
  });
}

async function installed(library: string): Promise<SourceFile> {
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

function valueImports(sourceFile: SourceFile): ImportSpecifier[] {
  return sourceFile
    .getImportDeclarations()
    .filter((declaration) => !declaration.isTypeOnly())
    .flatMap((declaration) => declaration.getNamedImports())
    .filter((named) => !named.isTypeOnly());
}

test('declaredNames collects every kind of local binding', () => {
  const sourceFile = new Project({
    useInMemoryFileSystem: true,
  }).createSourceFile(
    'fixture.ts',
    [
      'const Variable = 1;',
      'const { key: Destructured } = { key: 1 };',
      'const [Element] = [1];',
      'function Declared(Param: number) {}',
      'const Held = function Expressed() {};',
      'class Klass {}',
      'const Kept = class Classed {};',
    ].join('\n'),
  );
  expect(new Set(declaredNames(sourceFile))).toEqual(
    new Set([
      'Classed',
      'Declared',
      'Destructured',
      'Element',
      'Expressed',
      'Held',
      'Kept',
      'Klass',
      'Param',
      'Variable',
    ]),
  );
});

// Run shadcn's own install-time transform, as `shadcn add` would.
describe.each(Object.keys(packages))(
  'installed with iconLibrary %s',
  (library) => {
    let sourceFile: SourceFile;
    beforeAll(async () => {
      sourceFile = await installed(library);
    });

    test('replaces every IconPlaceholder and imports each icon', () => {
      expect(sourceFile.getFullText()).not.toMatch(/<IconPlaceholder\b/u);
      const imported = new Set(
        valueImports(sourceFile).map((named) => named.getName()),
      );
      const wanted = entries.map(({ names }) => String(names[library]));
      expect(wanted.filter((name) => !imported.has(name))).toEqual([]);
    });

    test('declares nothing named like an imported icon', () => {
      const bound = new Set(
        valueImports(sourceFile).map((named) => boundName(named)),
      );
      expect(
        declaredNames(sourceFile).filter((name) => bound.has(name)),
      ).toEqual([]);
    });
  },
);

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
