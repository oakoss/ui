import { defineConfig } from 'fumadocs-mdx/config';
import {
  createFileSystemGeneratorCache,
  createGenerator,
  remarkAutoTypeTable,
  type RemarkAutoTypeTableOptions,
} from 'fumadocs-typescript';

import { INHERITED_PREFIX, isInheritedDeclaration } from './src/lib/props';

const typeTable: RemarkAutoTypeTableOptions = {
  generator: createGenerator({
    cache: createFileSystemGeneratorCache(
      'node_modules/.cache/fumadocs-typescript',
    ),
    tsconfigPath: 'tsconfig.json',
  }),
  options: {
    transform(entry, _type, prop) {
      if (isInheritedDeclaration(prop.declarations[0]?.path)) {
        entry.name = `${INHERITED_PREFIX}${entry.name}`;
      }
    },
  },
  // Otherwise the full prop JSON (inherited props included) lands in the
  // search index and the Markdown/llms.txt output.
  remarkStringify: false,
};

export default defineConfig({
  mdxOptions: { remarkPlugins: [[remarkAutoTypeTable, typeTable]] },
});
