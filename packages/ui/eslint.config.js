import reactConfig from '@oakoss/eslint-config/react';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  // Ignore generated output files
  globalIgnores(['public/**']),

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

  // UI package-specific overrides
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Starters use different file naming patterns
      'unicorn/filename-case': 'off',
    },
  },

  // Disable Tailwind plugin for CSS starter (no tailwind.config)
  {
    files: ['starters/react-aria-css/**/*.{ts,tsx}'],
    rules: {
      'better-tailwindcss/enforce-shorthand-classes': 'off',
      'better-tailwindcss/no-deprecated-classes': 'off',
      'better-tailwindcss/no-duplicate-classes': 'off',
    },
  },
);
