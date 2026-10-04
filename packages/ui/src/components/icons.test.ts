import type { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

import * as hugeicons from '@hugeicons/core-free-icons';
import * as phosphor from '@phosphor-icons/react';
import * as remixicon from '@remixicon/react';
import * as tabler from '@tabler/icons-react';
import * as lucide from 'lucide-react';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { transformIcons } from 'shadcn/utils';
import ts from 'typescript';
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
      : library;
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

type SourceFile = Parameters<typeof transformIcons>[0]['sourceFile'];

type TsMorph = {
  Project: new (options: { useInMemoryFileSystem: boolean }) => {
    createSourceFile: (name: string, text: string) => SourceFile;
  };
};

function isTsMorph(value: unknown): value is TsMorph {
  return (
    typeof value === 'object' &&
    value !== null &&
    'Project' in value &&
    typeof value.Project === 'function'
  );
}

// shadcn's transform only matches nodes from its own ts-morph version; a file
// from another version passes through untransformed.
const tsMorph: unknown = createRequire(import.meta.resolve('shadcn/utils'))(
  'ts-morph',
);
if (!isTsMorph(tsMorph)) throw new Error("shadcn's ts-morph has no Project");
const { Project } = tsMorph;

// A local named like an imported icon renders itself instead of the icon.
function declaredNames(text: string): string[] {
  return descendants(parse(text)).flatMap((node) =>
    isNamedDeclaration(node) && node.name && ts.isIdentifier(node.name)
      ? node.name.text
      : [],
  );
}

function descendants(node: ts.Node): ts.Node[] {
  const children: ts.Node[] = [];
  ts.forEachChild(node, (child) => {
    children.push(child, ...descendants(child));
  });
  return children;
}

async function installed(library: string): Promise<string> {
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
  return sourceFile.getFullText();
}

function isNamedDeclaration(
  node: ts.Node,
): node is { name?: ts.Node } & ts.Node {
  return (
    ts.isVariableDeclaration(node) ||
    ts.isBindingElement(node) ||
    ts.isParameter(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isClassDeclaration(node) ||
    ts.isClassExpression(node)
  );
}

function parse(text: string): ts.SourceFile {
  return ts.createSourceFile('icons.tsx', text, ts.ScriptTarget.Latest, true);
}

// Value imports as [imported name, local name], the alias when renamed.
function valueImports(text: string): [string, string][] {
  return parse(text).statements.flatMap((statement) => {
    const clause = ts.isImportDeclaration(statement)
      ? statement.importClause
      : undefined;
    const bindings = clause?.namedBindings;
    const isTypeOnly = clause?.phaseModifier === ts.SyntaxKind.TypeKeyword;
    if (!clause || isTypeOnly || !bindings) return [];
    if (!ts.isNamedImports(bindings)) return [];
    return bindings.elements
      .filter((element) => !element.isTypeOnly)
      .map((element): [string, string] => [
        (element.propertyName ?? element.name).text,
        element.name.text,
      ]);
  });
}

test('valueImports skips type-only imports and binds aliases', () => {
  const fixture = [
    "import { A, B as C, type D } from 'x';",
    "import type { E } from 'y';",
  ].join('\n');
  expect(valueImports(fixture)).toEqual([
    ['A', 'A'],
    ['B', 'C'],
  ]);
});

test('declaredNames collects every kind of local binding', () => {
  const fixture = [
    'const Variable = 1;',
    'const { key: Destructured } = { key: 1 };',
    'const [Element] = [1];',
    'function Declared(Param: number) {}',
    'const Held = function Expressed() {};',
    'class Klass {}',
    'const Kept = class Classed {};',
  ].join('\n');
  expect(new Set(declaredNames(fixture))).toEqual(
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
    let text = '';
    beforeAll(async () => {
      text = await installed(library);
    });

    test('replaces every IconPlaceholder and imports each icon', () => {
      expect(text).not.toMatch(/<IconPlaceholder\b/u);
      const imported = new Set(valueImports(text).map(([name]) => name));
      const wanted = entries.map(({ names }) => String(names[library]));
      expect(wanted.filter((name) => !imported.has(name))).toEqual([]);
    });

    test('declares nothing named like an imported icon', () => {
      const bound = new Set(valueImports(text).map(([, local]) => local));
      expect(declaredNames(text).filter((name) => bound.has(name))).toEqual([]);
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
