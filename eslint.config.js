//  @ts-check

import pluginReact from '@eslint-react/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import oxlint from 'eslint-plugin-oxlint';
import perfectionist from 'eslint-plugin-perfectionist';
import reactHooks from 'eslint-plugin-react-hooks';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'node_modules',
    'dist',
    'coverage',
    'test-results',
    'storybook-static',
    '.env*',
  ]),
  { languageOptions: { ecmaVersion: 'latest', globals: globals.browser } },

  // TypeScript, type-aware. oxlint owns the syntactic TS rules (disabled below
  // by buildFromOxlint); ESLint keeps the type-aware ones.
  {
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // @eslint-react contributes ONLY the rules oxlint's react plugin can't do
  // (type-aware leak detection, modern footguns, naming). oxlint owns the rest;
  // this list shrinks as oxlint gains react coverage. Hooks/compiler rules are
  // left to eslint-plugin-react-hooks below.
  {
    files: ['**/*.tsx'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { '@eslint-react': pluginReact },
    rules: {
      '@eslint-react/dom-no-flush-sync': 'error',
      '@eslint-react/dom-no-hydrate': 'error',
      '@eslint-react/dom-no-missing-button-type': 'error',
      '@eslint-react/dom-no-render': 'error',
      '@eslint-react/dom-no-unsafe-iframe-sandbox': 'error',
      '@eslint-react/dom-no-use-form-state': 'error',
      '@eslint-react/jsx-no-children-prop-with-children': 'error',
      '@eslint-react/jsx-no-key-after-spread': 'error',
      '@eslint-react/jsx-no-leaked-dollar': 'error',
      '@eslint-react/jsx-no-leaked-semicolon': 'error',
      '@eslint-react/jsx-no-namespace': 'error',
      '@eslint-react/naming-convention-context-name': 'error',
      '@eslint-react/naming-convention-id-name': 'error',
      '@eslint-react/naming-convention-ref-name': 'error',
      '@eslint-react/no-access-state-in-setstate': 'error',
      '@eslint-react/no-class-component': 'error',
      '@eslint-react/no-context-provider': 'error',
      '@eslint-react/no-create-ref': 'error',
      '@eslint-react/no-forward-ref': 'error',
      '@eslint-react/no-leaked-conditional-rendering': 'error',
      '@eslint-react/no-misused-capture-owner-stack': 'error',
      '@eslint-react/no-nested-lazy-component-declarations': 'error',
      '@eslint-react/no-unnecessary-use-prefix': 'error',
      '@eslint-react/no-unused-props': 'error',
      '@eslint-react/no-use-context': 'error',
      '@eslint-react/use-state': 'error',
      '@eslint-react/web-api-no-leaked-event-listener': 'error',
      '@eslint-react/web-api-no-leaked-fetch': 'error',
      '@eslint-react/web-api-no-leaked-intersection-observer': 'error',
      '@eslint-react/web-api-no-leaked-interval': 'error',
      '@eslint-react/web-api-no-leaked-resize-observer': 'error',
      '@eslint-react/web-api-no-leaked-timeout': 'error',
    },
    settings: {
      'react-x': {
        importSource: 'react',
        polymorphicPropName: 'as',
        version: 'detect',
      },
    },
  },

  // Official React Compiler + hooks rules. buildFromOxlint disables both
  // react-hooks rules from its static map; oxlint owns rules-of-hooks, and
  // exhaustive-deps is re-enabled below as a warning (oxlint doesn't run it).
  {
    extends: [reactHooks.configs.flat['recommended-latest']],
    files: ['**/*.{ts,tsx}'],
  },

  // unicorn / jsx-a11y / vitest: oxlint runs the rules it supports;
  // buildFromOxlint (last) disables those here. jsx-a11y coverage in oxlint
  // is near-complete; only ~1 rule survives to ESLint.
  eslintPluginUnicorn.configs.recommended,
  { extends: [jsxA11y.flatConfigs.strict], files: ['**/*.tsx'] },
  {
    extends: [vitest.configs.recommended],
    files: ['**/*.{test,spec}.{ts,tsx}', '**/*.integration.{ts,tsx}'],
  },

  // Sorting. oxfmt owns import-statement order, so sort-imports is disabled in
  // the override layer below.
  perfectionist.configs['recommended-alphabetical'],

  // import-x: only the gap rules that don't need a resolver. The resolution
  // rules (no-unresolved, named, export, no-named-as-default*) are deferred
  // until an import style + resolver are chosen.
  {
    plugins: { 'import-x': importX },
    rules: {
      'import-x/newline-after-import': 'error',
      'import-x/no-useless-path-segments': 'error',
    },
  },

  // better-tailwindcss: held pending the Tailwind decision.
  {
    plugins: { tailwind: betterTailwindcss },
    rules: {
      'tailwind/enforce-shorthand-classes': 'warn',
      'tailwind/no-deprecated-classes': 'warn',
      'tailwind/no-duplicate-classes': 'warn',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/globals.css',
        rootFontSize: 16,
        tsconfig: './tsconfig.json',
      },
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    // Test files use dynamic imports intentionally (vi.mock factories).
    ignores: ['**/*.test.{ts,tsx}', '**/*.integration.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          message: 'Use static import instead of dynamic import().',
          selector: 'ImportExpression',
        },
      ],
    },
  },

  // Must be after every recommended extend: turns off the rules oxlint owns.
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),

  // Override layer: our deliberate exceptions, after the oxlint dedup. These
  // also mirror oxlint `off` settings that the ESLint recommended configs would
  // otherwise re-enable (buildFromOxlint only propagates oxlint's enabled rules).
  {
    rules: {
      // oxfmt owns import-statement order.
      'perfectionist/sort-imports': 'off',
      // 'props'/'ref'/'params' are React idioms, not abbreviations to expand.
      'unicorn/name-replacements': 'off',
      // nested ternaries are common in JSX conditional rendering.
      'unicorn/no-nested-ternary': 'off',
      // null is idiomatic in React (render nothing, ref init).
      'unicorn/no-null': 'off',
      // a library must not ship top-level await — it forces an async module
      // graph onto every consumer.
      'unicorn/prefer-top-level-await': 'off',
    },
  },
  // react-hooks is only registered for TS/TSX, so its re-enable must be scoped
  // there (buildFromOxlint turns exhaustive-deps off; we want it as a warning).
  {
    files: ['**/*.{ts,tsx}'],
    rules: { 'react-hooks/exhaustive-deps': 'warn' },
  },

  // JS config files aren't in the type-aware program — drop type-checked rules.
  {
    extends: [tseslint.configs.disableTypeChecked],
    files: ['**/*.{js,mjs,cjs}'],
  },
);
