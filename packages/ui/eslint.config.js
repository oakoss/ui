import { base } from '@oakoss/eslint-config/base';
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
  oxlint(oxlintConfig),
);
