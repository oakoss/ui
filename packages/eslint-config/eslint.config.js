import { defineConfig } from 'eslint/config';

import baseConfig from './base.js';

export default defineConfig(...baseConfig, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
