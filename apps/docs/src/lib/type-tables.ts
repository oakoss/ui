import {
  createFileSystemGeneratorCache,
  createGenerator,
  type GeneratedDoc,
  type RemarkAutoTypeTableOptions,
  typeTableToMarkdown,
} from 'fumadocs-typescript';

import { type File, type Node, recordMarkdown } from './expansion-output';
import {
  INHERITED_PREFIX,
  isInheritedDeclaration,
  NO_OWN_PROPS,
  ownEntries,
} from './props';

const generator = createGenerator({
  cache: createFileSystemGeneratorCache(
    'node_modules/.cache/fumadocs-typescript',
  ),
  tsconfigPath: 'tsconfig.json',
});

// Each generated table by the id auto-type-table gives its TypeTable element.
const tables = new Map<string, GeneratedDoc>();
const tablePrefix = 'type-table-';

export const typeTableOptions: RemarkAutoTypeTableOptions = {
  // Drops the props marked below, so pages, search and the Markdown output
  // list only a component's own props.
  generator: {
    ...generator,
    async generateTypeTable(props, options) {
      const docs = await generator.generateTypeTable(props, options);
      return docs.map((doc) => {
        const own = { ...doc, entries: ownEntries(doc.entries) };
        tables.set(`${tablePrefix}${doc.id}`, own);
        return own;
      });
    },
  },
  options: {
    transform(entry, _type, prop) {
      if (isInheritedDeclaration(prop.declarations[0]?.path)) {
        entry.name = `${INHERITED_PREFIX}${entry.name}`;
      }
    },
  },
  // remarkTypeTableMarkdown reads the tables above, not a JSON copy.
  remarkStringify: false,
};

/**
Records each type table's Markdown without the `###` heading auto-type-table
gives it: pages head every table themselves (`#### Props`), and a second
heading there breaks the outline. Runs right after remarkAutoTypeTable, which
turns each `<auto-type-table>` into a root of `TypeTable` elements.
*/
export function remarkTypeTableMarkdown() {
  return (tree: Node, file: File) => {
    visit(tree, (node) => {
      const docs = (node.children ?? []).flatMap((child) => {
        const doc = generatedDoc(child);
        return doc ? [doc] : [];
      });
      if (docs.length === 0) return;
      const markdown = docs.map((doc) => typeTableMarkdown(doc));
      recordMarkdown(file, node, markdown.join('\n\n'));
    });
  };
}

// A type table's Markdown without auto-type-table's `###` heading.
export function typeTableMarkdown(doc: GeneratedDoc): string {
  if (doc.entries.length === 0) return NO_OWN_PROPS;
  const heading = `### ${doc.name}\n\n`;
  const markdown = typeTableToMarkdown(doc);
  if (!markdown.startsWith(heading)) {
    throw new Error(
      `type table "${doc.name}" no longer starts with its heading`,
    );
  }
  return markdown.slice(heading.length);
}

function generatedDoc(node: Node): GeneratedDoc | undefined {
  if (node.name !== 'TypeTable') return undefined;
  const id = node.attributes?.find((entry) => entry.name === 'id')?.value;
  if (typeof id !== 'string' || !id.startsWith(tablePrefix)) return undefined;
  const doc = tables.get(id);
  // A miss would ship auto-type-table's Markdown, heading included.
  if (doc === undefined) throw new Error(`no generated type table "${id}"`);
  return doc;
}

function visit(node: Node, visitor: (node: Node) => void) {
  visitor(node);
  const children = node.children ?? [];
  for (const child of children) visit(child, visitor);
}
