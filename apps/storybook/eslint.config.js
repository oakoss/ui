import { base } from '@oakoss/eslint-config/base';
import { oxlint } from '@oakoss/eslint-config/oxlint';
import { react } from '@oakoss/eslint-config/react';
import { storybook } from '@oakoss/eslint-config/storybook';
import { tailwind } from '@oakoss/eslint-config/tailwind';
import { vitest } from '@oakoss/eslint-config/vitest';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import oxlintConfig from './oxlint.config.ts';

const uiStylesheet = fileURLToPath(
  import.meta.resolve('@oakoss/ui/styles.css'),
);

export default defineConfig(
  base({ tsconfigRootDir: import.meta.dirname }),
  react,
  vitest,
  storybook({ packageJson: path.join(import.meta.dirname, 'package.json') }),
  tailwind({
    entryPoint: uiStylesheet,
    tsconfig: path.join(import.meta.dirname, 'tsconfig.json'),
  }),
  {
    // vitest/browser throws when loaded outside the Vitest run, so the
    // helpers that use it import it on call and story files still open in
    // plain Storybook.
    files: ['src/paint.ts', 'src/viewport.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  oxlint(oxlintConfig),
);
