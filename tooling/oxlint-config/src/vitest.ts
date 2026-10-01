import { defineConfig } from 'oxlint';

export default defineConfig({
  overrides: [
    {
      files: ['**/*.test.*', '**/*.spec.*', '**/*.integration.*'],
      plugins: ['vitest'],
      rules: {
        'vitest/consistent-each-for': 'error',
        'vitest/no-identical-title': 'error',
        'vitest/no-import-node-test': 'error',
        'vitest/no-interpolation-in-snapshots': 'error',
        'vitest/no-mocks-import': 'error',
        'vitest/no-standalone-expect': [
          'error',
          { additionalTestBlockFunctions: ['test'] },
        ],
        'vitest/no-unneeded-async-expect-function': 'error',
        'vitest/prefer-called-exactly-once-with': 'error',
        'vitest/prefer-called-once': 'error',
        'vitest/prefer-expect-type-of': 'off',
        'vitest/prefer-to-be-falsy': 'off',
        'vitest/prefer-to-be-object': 'error',
        'vitest/prefer-to-be-truthy': 'off',
        'vitest/require-mock-type-parameters': 'off',
        'vitest/require-to-throw-message': 'off',
      },
    },
  ],
});
