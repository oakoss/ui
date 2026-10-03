import { base, restrictedSyntax } from '@oakoss/eslint-config/base';
import { oxlint } from '@oakoss/eslint-config/oxlint';
import { react } from '@oakoss/eslint-config/react';
import { tailwind } from '@oakoss/eslint-config/tailwind';
import { vitest } from '@oakoss/eslint-config/vitest';
import { defineConfig } from 'eslint/config';
import path from 'node:path';

import oxlintConfig from './oxlint.config.ts';

export default defineConfig(
  base({ tsconfigRootDir: import.meta.dirname }),
  react,
  vitest,
  tailwind({
    entryPoint: path.join(import.meta.dirname, 'src/styles/globals.css'),
    tsconfig: path.join(import.meta.dirname, 'tsconfig.json'),
  }),
  {
    files: ['src/components/**/*.tsx'],
    ignores: ['**/*.{test,spec}.tsx'],
    rules: {
      // tailwind-variants/lite doesn't merge; cn and cx do.
      'no-restricted-syntax': [
        'error',
        ...restrictedSyntax,
        {
          message:
            'Pass className through cx() (render props) or cn() (strings) so conflicting classes merge.',
          selector:
            "JSXAttribute[name.name='className'] > JSXExpressionContainer > :not(CallExpression[callee.name=/^(cn|cx)$/])",
        },
        {
          message:
            "Import icons as a namespace (import * as Icon from '#/components/icons') so they can't clash with component names.",
          selector:
            'ImportDeclaration[source.value=/(^|\\/)components\\/icons$/] > ImportSpecifier',
        },
        {
          message:
            'Use #/components/icons; shadcn swaps in the consumer’s icon library at install.',
          selector:
            'ImportDeclaration[source.value=/^((lucide-react|@tabler\\/icons-react|@phosphor-icons\\/react|@remixicon\\/react)(\\/|$)|@hugeicons\\/)/]',
        },
      ],
    },
  },
  oxlint(oxlintConfig),
);
