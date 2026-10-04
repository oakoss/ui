import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import react from '@oakoss/oxlint-config/react';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig(
  compose(base, react, vitest, {
    ignorePatterns: ['src/routeTree.gen.ts'],
    // `_splat` is TanStack Router's catch-all param name; `_compiler` is
    // fumadocs-mdx's handle on the file a remark plugin compiles.
    rules: {
      'no-underscore-dangle': ['error', { allow: ['_compiler', '_splat'] }],
    },
  }),
);
