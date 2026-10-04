import registry from '@oakoss/ui/registry.json';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { manualSources } from './manual-sources';
import { githubUrl } from './site';

const ui = path.dirname(
  fileURLToPath(import.meta.resolve('@oakoss/ui/registry.json')),
);
const demos = path.join(import.meta.dirname, '../components/demos');

type Item = (typeof registry.items)[number];

type Node = {
  attributes?: { name: string; value: unknown }[];
  children?: Node[];
  lang?: string;
  meta?: string;
  name?: string;
  type: string;
  url?: string;
  value?: string;
};

type PackageManager = { add: string; dlx: string; name: string };

type Read = (file: string) => string;

const packageManagers: PackageManager[] = [
  { add: 'npm install', dlx: 'npx', name: 'npm' },
  { add: 'pnpm add', dlx: 'pnpm dlx', name: 'pnpm' },
  { add: 'yarn add', dlx: 'yarn dlx', name: 'yarn' },
  { add: 'bun add', dlx: 'bunx --bun', name: 'bun' },
];

function attribute(node: Node, name: string): string | undefined {
  const value = node.attributes?.find((entry) => entry.name === name)?.value;
  return typeof value === 'string' ? value : undefined;
}

function code(lang: string, value: string, meta?: string): Node {
  return { lang, meta, type: 'code', value };
}

// Package-manager tabs whose choice persists across pages.
function commandTabs(command: (manager: PackageManager) => string): Node {
  return element(
    'CodeBlockTabs',
    { defaultValue: 'npm', groupId: 'package-manager', persist: null },
    [
      element(
        'CodeBlockTabsList',
        {},
        packageManagers.map(({ name }) =>
          element('CodeBlockTabsTrigger', { value: name }, [
            { type: 'text', value: name },
          ]),
        ),
      ),
      ...packageManagers.map((manager) =>
        element('CodeBlockTab', { value: manager.name }, [
          code('bash', command(manager)),
        ]),
      ),
    ],
  );
}

// A null attribute value renders as a bare boolean attribute.
function element(
  name: string,
  attributes: Record<string, null | string>,
  children: Node[],
): Node {
  return {
    attributes: Object.entries(attributes).map(([key, value]) => ({
      name: key,
      type: 'mdxJsxAttribute',
      value,
    })),
    children,
    name,
    type: 'mdxJsxFlowElement',
  };
}

// A paragraph from plain strings and inline nodes.
function paragraph(...parts: (Node | string)[]): Node {
  return {
    children: parts.map((part) =>
      typeof part === 'string' ? { type: 'text', value: part } : part,
    ),
    type: 'paragraph',
  };
}

function tabs(entries: [string, Node[]][]): Node {
  return element('Tabs', { defaultValue: entries[0]?.[0] ?? '' }, [
    element(
      'TabsList',
      {},
      entries.map(([label]) =>
        element('TabsTrigger', { value: label }, [
          { type: 'text', value: label },
        ]),
      ),
    ),
    ...entries.map(([label, children]) =>
      element('TabsContent', { value: label }, children),
    ),
  ]);
}

// shadcn's default alias directories.
const aliasDirectories: Record<string, string> = {
  components: 'components',
  lib: 'lib',
  ui: 'components/ui',
};

/**
 * Expands `<ComponentPreview name>` and `<ComponentInstall item>` into
 * Markdown at build time, so the demo source and install steps also reach the
 * `.md` and llms.txt output, and the install steps' text reaches search.
 */
export function remarkComponentDocs() {
  return (tree: Node, file: { data: object }) => {
    const compiler = '_compiler' in file.data ? file.data._compiler : undefined;
    // Registered so the dev server recompiles the page when a source changes.
    const read: Read = (source) => {
      if (hasAddDependency(compiler)) compiler.addDependency(source);
      return readFileSync(source, 'utf-8');
    };
    transform(tree, read);
  };
}

// The item and every item it depends on, dependencies first.
function closure(name: string, seen = new Set<string>()): Item[] {
  if (seen.has(name)) return [];
  seen.add(name);
  const item = findItem(name);
  const deps = (item.registryDependencies ?? []).flatMap((dep) =>
    closure(dep.replace('oakoss/ui/', ''), seen),
  );
  return [...deps, item];
}

function fileList(files: { path: string; target: string }[]): Node {
  return {
    children: files.map((file) => ({
      children: [
        paragraph({
          children: [{ type: 'inlineCode', value: targetPath(file.target) }],
          type: 'link',
          url: `${githubUrl}/blob/main/packages/ui/${file.path}`,
        }),
      ],
      type: 'listItem',
    })),
    type: 'list',
  };
}

function findItem(name: string): Item {
  const item = registry.items.find((candidate) => candidate.name === name);
  if (item === undefined) throw new Error(`no registry item named "${name}"`);
  return item;
}

// fumadocs-mdx puts its compiler on vfile.data while it compiles a page.
function hasAddDependency(
  compiler: unknown,
): compiler is { addDependency: (file: string) => void } {
  return (
    typeof compiler === 'object' &&
    compiler !== null &&
    'addDependency' in compiler &&
    typeof compiler.addDependency === 'function'
  );
}

// shadcn add swaps icons.tsx's placeholders for the project's icon library.
function iconStep(): Node {
  return element('Step', {}, [
    paragraph(
      'Replace each ',
      { type: 'inlineCode', value: '<IconPlaceholder>' },
      ' in ',
      { type: 'inlineCode', value: 'icons.tsx' },
      " with your icon library's icon, named in its props. The CLI does this for you; without it, icons render as empty squares.",
    ),
  ]);
}

function install(name: string, read: Read): Node {
  return tabs([
    [
      'CLI',
      [commandTabs(({ dlx }) => `${dlx} shadcn@latest add oakoss/ui/${name}`)],
    ],
    ['Manual', [manualSteps(closure(name), read)]],
  ]);
}

function manualSteps(items: Item[], read: Read): Node {
  const packages = [
    ...new Set(items.flatMap((item) => item.dependencies ?? [])),
  ].toSorted((a, b) => a.localeCompare(b));
  const files = new Map(
    items.flatMap((item) => item.files ?? []).map((file) => [file.path, file]),
  )
    .values()
    .toArray();
  const sources = files.map((file) =>
    code(
      'tsx',
      read(path.join(ui, file.path)),
      `title="${targetPath(file.target)}"`,
    ),
  );
  return element('Steps', {}, [
    element('Step', {}, [
      paragraph(
        'Set up the theme and base styles from ',
        {
          children: [{ type: 'text', value: 'Installation' }],
          type: 'link',
          url: '/docs/installation',
        },
        '.',
      ),
    ]),
    element('Step', {}, [
      paragraph('Install the packages.'),
      commandTabs(({ add }) => `${add} ${packages.join(' ')}`),
    ]),
    element('Step', {}, [
      paragraph(
        'Copy each file into your project, and change its ',
        { type: 'inlineCode', value: '#/' },
        ' imports to your aliases.',
      ),
      fileList(files),
      element(manualSources, {}, sources),
    ]),
    ...(files.some((file) => file.path.endsWith('icon-placeholder.tsx'))
      ? [iconStep()]
      : []),
  ]);
}

function preview(node: Node, read: Read): Node {
  const name = attribute(node, 'name');
  if (name === undefined) throw new Error('<ComponentPreview> needs a name');
  // Shown with the import paths an installed project uses.
  const source = read(path.join(demos, `${name}.tsx`)).replaceAll(
    "from '@oakoss/ui/",
    "from '#/",
  );
  return tabs([
    ['Preview', node.children ?? []],
    ['Code', [code('tsx', source)]],
  ]);
}

function targetPath(target: string): string {
  return target.replace(/^@(\w+)\//u, (match, alias: string) =>
    aliasDirectories[alias] === undefined
      ? match
      : `${aliasDirectories[alias]}/`,
  );
}

function transform(node: Node, read: Read): Node {
  if (node.type === 'mdxJsxFlowElement' && node.name === 'ComponentPreview') {
    return preview(node, read);
  }
  if (node.type === 'mdxJsxFlowElement' && node.name === 'ComponentInstall') {
    const item = attribute(node, 'item');
    if (item === undefined) throw new Error('<ComponentInstall> needs an item');
    return install(item, read);
  }
  if (node.children) {
    node.children = node.children.map((child) => transform(child, read));
  }
  return node;
}
