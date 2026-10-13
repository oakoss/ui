import registry from '@oakoss/ui/registry.json';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { type File, type Node, recordExpansion } from './expansion-output';
import { manualSources } from './manual-sources';
import {
  type PackageManager,
  packageManagerKey,
  packageManagers,
} from './package-managers';
import { targetPath } from './registry-paths';
import { githubUrl } from './site';

const demos = path.join(import.meta.dirname, '../components/demos');

type Item = (typeof registry.items)[number];

type Read = (file: string) => string;

/**
Expands `<ComponentPreview name>` and `<ComponentInstall item>` into
Markdown at build time, so the demo source and install steps also reach the
`.md` and llms.txt output, and the install steps' text reaches search.
*/
export function remarkComponentDocs() {
  return (tree: Node, file: File) => {
    const compiler = '_compiler' in file.data ? file.data._compiler : undefined;
    // Registered so the dev server recompiles the page when a source changes.
    const read: Read = (source) => {
      if (hasAddDependency(compiler)) compiler.addDependency(source);
      return readFileSync(source, 'utf-8');
    };
    transform(tree, read, (node, expanded) =>
      recordExpansion(file, node, expanded),
    );
  };
}

function attribute(node: Node, name: string): string | undefined {
  const value = node.attributes?.find((entry) => entry.name === name)?.value;
  return typeof value === 'string' ? value : undefined;
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

function code(lang: string, value: string): Node {
  return { lang, type: 'code', value };
}

// Package-manager tabs whose choice persists across pages.
function commandTabs(command: (manager: PackageManager) => string): Node {
  return element(
    'CodeBlockTabs',
    { defaultValue: 'npm', groupId: packageManagerKey, persist: null },
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

function install(name: string): Node {
  return tabs([
    [
      'CLI',
      [commandTabs(({ dlx }) => `${dlx} shadcn@latest add oakoss/ui/${name}`)],
    ],
    ['Manual', [manualSteps(closure(name))]],
  ]);
}

function manualSteps(items: Item[]): Node {
  const packages = [
    ...new Set(items.flatMap((item) => item.dependencies ?? [])),
  ].toSorted((a, b) => a.localeCompare(b));
  const files = new Map(
    items.flatMap((item) => item.files ?? []).map((file) => [file.path, file]),
  )
    .values()
    .toArray();
  // Placeholders the Manual tab fills by loading each file's own module.
  const sources = files.map((file) =>
    element('ManualSource', { file: file.path }, []),
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

// A paragraph from plain strings and inline nodes.
function paragraph(...parts: (Node | string)[]): Node {
  return {
    children: parts.map((part) =>
      typeof part === 'string' ? { type: 'text', value: part } : part,
    ),
    type: 'paragraph',
  };
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

function transform(
  node: Node,
  read: Read,
  expand: (node: Node, expanded: Node) => Node,
): Node {
  if (node.type === 'mdxJsxFlowElement' && node.name === 'ComponentPreview') {
    return expand(node, preview(node, read));
  }
  if (node.type === 'mdxJsxFlowElement' && node.name === 'ComponentInstall') {
    const item = attribute(node, 'item');
    if (item === undefined) throw new Error('<ComponentInstall> needs an item');
    return expand(node, install(item));
  }
  if (node.children) {
    node.children = node.children.map((child) =>
      transform(child, read, expand),
    );
  }
  return node;
}
