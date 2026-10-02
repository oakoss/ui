import { defineConfig } from 'oxfmt';

export default defineConfig({
  ignorePatterns: [
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'node_modules/',
    'dist/',
    'build/',
    '*.log',
    '**/routeTree.gen.ts',
    // Generated and rewritten by beads.
    '.beads/',
  ],
  objectWrap: 'collapse',
  printWidth: 80,
  singleQuote: true,
  sortImports: {
    customGroups: [
      { elementNamePattern: ['#test/**'], groupName: 'test-imports' },
    ],
    groups: [
      'side_effect',
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      ['value-internal', 'test-imports'],
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
    newlinesBetween: true,
  },
  sortPackageJson: { sortScripts: true },
  sortTailwindcss: {
    functions: ['cn', 'clsx', 'cva', 'cx', 'tv'],
    stylesheet: './packages/ui/src/styles/globals.css',
  },
});
