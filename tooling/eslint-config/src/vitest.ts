import vitestPlugin from '@vitest/eslint-plugin';

// oxlint runs the vitest rules it enables; the finisher disables those here.
export const vitest = [
  {
    extends: [vitestPlugin.configs.recommended],
    files: ['**/*.{test,spec}.{ts,tsx}', '**/*.integration.{ts,tsx}'],
  },
];
