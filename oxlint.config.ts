import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig({
  ...compose(base, vitest),
  ignorePatterns: [
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    'storybook-static',
  ],
  options: {
    maxWarnings: 0,
    reportUnusedDisableDirectives: 'error',
    typeAware: true,
  },
});
