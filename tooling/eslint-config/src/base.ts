import { importX } from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const head = [
  globalIgnores([
    '**/node_modules',
    '**/dist',
    '**/coverage',
    '**/test-results',
    '**/storybook-static',
    '**/.env*',
  ]),
  { languageOptions: { ecmaVersion: 'latest', globals: globals.browser } },
];

// A package that sets its own no-restricted-syntax replaces these options, so
// it spreads them back in.
export const restrictedSyntax = [
  {
    message: 'Use static import instead of dynamic import().',
    selector: 'ImportExpression',
  },
] as const;

const tail = [
  // oxlint runs the unicorn rules it enables; the finisher disables those here.
  eslintPluginUnicorn.configs.recommended,

  // Sorting. oxfmt owns import-statement order, so the finisher disables
  // sort-imports.
  perfectionist.configs['recommended-alphabetical'],

  // import-x: only the gap rules that don't need a resolver. The resolution
  // rules (no-unresolved, named, export, no-named-as-default*) are deferred
  // until an import style + resolver are chosen.
  {
    plugins: { 'import-x': importX },
    rules: { 'import-x/no-useless-path-segments': 'error' },
  },

  {
    files: ['**/src/**/*.{ts,tsx}'],
    // Test files use dynamic imports intentionally (vi.mock factories).
    ignores: ['**/*.{test,spec}.{ts,tsx}', '**/*.integration.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...restrictedSyntax] },
  },
];

export function base({
  tsconfigRootDir,
}: {
  readonly tsconfigRootDir: string;
}) {
  return [
    ...head,
    // TypeScript, type-aware. oxlint owns the TS rules it implements (disabled
    // by the oxlint finisher); ESLint keeps the rest.
    {
      extends: [
        tseslint.configs.strictTypeChecked,
        tseslint.configs.stylisticTypeChecked,
      ],
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir },
      },
    },
    ...tail,
  ];
}
