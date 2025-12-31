import reactConfig from '@repo/eslint-config/react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  // Ignore generated files
  globalIgnores(['.source/**']),

  ...reactConfig,

  // Required: Set tsconfigRootDir for type-checked rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Override Tailwind CSS entry point
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/app.css',
      },
    },
  },

  // Docs-specific rule overrides
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // MDX content files may have different patterns
      'unicorn/filename-case': 'off',
      // Fumadocs uses dynamic component patterns
      'react-hooks/static-components': 'off',
    },
  },
);
