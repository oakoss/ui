import { expect, test } from 'vitest';

import { compose } from './compose';

test('lets a later piece override an earlier rule', () => {
  const config = compose(
    { rules: { 'no-console': 'error' } },
    { rules: { 'no-console': 'off' } },
  );
  expect(config.rules).toEqual({ 'no-console': 'off' });
});

test('unions plugins and concatenates overrides', () => {
  const config = compose(
    {
      overrides: [{ files: ['a'], rules: {} }],
      plugins: ['import', 'unicorn'],
    },
    { overrides: [{ files: ['b'], rules: {} }], plugins: ['import', 'react'] },
  );
  expect(config.plugins).toEqual(['import', 'unicorn', 'react']);
  expect(config.overrides?.map((override) => override.files)).toEqual([
    ['a'],
    ['b'],
  ]);
});

test('merges categories and nested settings', () => {
  const config = compose(
    {
      categories: { correctness: 'error' },
      settings: { 'jsx-a11y': { polymorphicPropName: 'as' } },
    },
    {
      categories: { perf: 'error' },
      settings: { 'jsx-a11y': { components: { Button: 'button' } } },
    },
  );
  expect(config.categories).toEqual({ correctness: 'error', perf: 'error' });
  expect(config.settings).toEqual({
    'jsx-a11y': { components: { Button: 'button' }, polymorphicPropName: 'as' },
  });
});

test('merges maps and unions lists from every piece', () => {
  const config = compose(
    {
      env: { browser: true },
      globals: { A: 'readonly' },
      ignorePatterns: ['a/**'],
      jsPlugins: ['a'],
      options: { maxWarnings: 0 },
      settings: { react: { version: '19' } },
    },
    {
      env: { node: true },
      globals: { B: 'readonly' },
      ignorePatterns: ['b/**'],
      jsPlugins: ['b'],
      settings: { react: undefined },
    },
  );
  expect(config).toMatchObject({
    env: { browser: true, node: true },
    globals: { A: 'readonly', B: 'readonly' },
    ignorePatterns: ['a/**', 'b/**'],
    jsPlugins: ['a', 'b'],
    options: { maxWarnings: 0 },
    settings: { react: { version: '19' } },
  });
});

test('leaves keys no piece sets unset', () => {
  const config = compose({ rules: { 'no-console': 'error' } });
  expect(Object.keys(config)).toEqual(['rules']);
});
