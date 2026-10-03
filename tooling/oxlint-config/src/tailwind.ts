import { fileURLToPath } from 'node:url';
import { defineConfig } from 'oxlint';

// Resolved here, where it's a dependency, so packages using this piece don't
// each need to install it.
const shadcnLint = fileURLToPath(import.meta.resolve('@shadcn/lint'));

// Token rules only. no-restyle waits for the per-component contracts
// (ui-m92.4); require-static-classes missed the dynamic case we tried.
export default defineConfig({
  jsPlugins: [shadcnLint],
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'shadcn/no-arbitrary-values': 'error',
        'shadcn/no-inline-styles': 'error',
        'shadcn/no-raw-colors': 'error',
        'shadcn/no-unknown-classes': 'error',
      },
    },
    {
      files: ['**/*.{integration,spec,test}.{ts,tsx}'],
      rules: { 'shadcn/no-raw-colors': 'off' },
    },
  ],
});
