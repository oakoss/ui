import { defineConfig } from 'fumadocs-mdx/config';
import { remarkAutoTypeTable } from 'fumadocs-typescript';

import { remarkComponentDocs } from './src/lib/remark-component-docs';
import {
  remarkTypeTableMarkdown,
  typeTableOptions,
} from './src/lib/type-tables';

export default defineConfig({
  mdxOptions: {
    remarkNpmOptions: { persist: { id: 'package-manager' } },
    remarkPlugins: [
      [remarkAutoTypeTable, typeTableOptions],
      remarkTypeTableMarkdown,
      remarkComponentDocs,
    ],
  },
});
