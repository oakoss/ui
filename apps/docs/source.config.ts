import { defineConfig } from 'fumadocs-mdx/config';
import { remarkAutoTypeTable } from 'fumadocs-typescript';

import { codeThemes } from './src/lib/code-themes';
import { remarkComponentDocs } from './src/lib/remark-component-docs';
import { remarkTokenDocs } from './src/lib/remark-token-docs';
import {
  remarkTypeTableMarkdown,
  typeTableOptions,
} from './src/lib/type-tables';

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: { themes: codeThemes },
    remarkNpmOptions: { persist: { id: 'package-manager' } },
    remarkPlugins: [
      [remarkAutoTypeTable, typeTableOptions],
      remarkTypeTableMarkdown,
      remarkComponentDocs,
      remarkTokenDocs,
    ],
  },
});
