import oxlintPlugin from 'eslint-plugin-oxlint';
import tseslint from 'typescript-eslint';

// Must be last. typeAware is passed because only the root oxlint config may
// set options.typeAware, so package configs can't carry it.
export function oxlint(
  oxlintConfig: Parameters<typeof oxlintPlugin.buildFromOxlintConfig>[0],
) {
  return [
    ...oxlintPlugin.buildFromOxlintConfig(oxlintConfig, {
      typeAware: true,
      withNursery: true,
    }),

    // Also mirrors oxlint `off` settings that the ESLint recommended configs
    // would otherwise re-enable (buildFromOxlint only propagates enabled rules).
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

    // JS config files aren't in the type-aware program — drop type-checked rules.
    {
      extends: [tseslint.configs.disableTypeChecked],
      files: ['**/*.{js,mjs,cjs}'],
    },
  ];
}
