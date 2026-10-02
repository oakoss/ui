import { base } from '@oakoss/eslint-config/base';
import { oxlint } from '@oakoss/eslint-config/oxlint';
import { vitest } from '@oakoss/eslint-config/vitest';
import { defineConfig } from 'eslint/config';

import oxlintConfig from './oxlint.config.ts';

export default defineConfig(
  base({ tsconfigRootDir: import.meta.dirname }),
  vitest,
  oxlint(oxlintConfig),
);
