import pluginReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export const react = [
  // @eslint-react contributes ONLY the rules oxlint's react plugin can't do.
  {
    files: ['**/*.tsx'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { '@eslint-react': pluginReact },
    rules: {
      '@eslint-react/dom-no-flush-sync': 'error',
      '@eslint-react/dom-no-hydrate': 'error',
      '@eslint-react/dom-no-render': 'error',
      '@eslint-react/dom-no-use-form-state': 'error',
      '@eslint-react/jsx-no-key-after-spread': 'error',
      '@eslint-react/jsx-no-leaked-dollar': 'error',
      '@eslint-react/jsx-no-leaked-semicolon': 'error',
      '@eslint-react/naming-convention-context-name': 'error',
      '@eslint-react/naming-convention-id-name': 'error',
      '@eslint-react/naming-convention-ref-name': 'error',
      '@eslint-react/no-access-state-in-setstate': 'error',
      '@eslint-react/no-context-provider': 'error',
      '@eslint-react/no-create-ref': 'error',
      '@eslint-react/no-forward-ref': 'error',
      '@eslint-react/no-misused-capture-owner-stack': 'error',
      '@eslint-react/no-nested-lazy-component-declarations': 'error',
      '@eslint-react/no-unnecessary-use-prefix': 'error',
      '@eslint-react/no-unused-props': 'error',
      '@eslint-react/no-use-context': 'error',
      '@eslint-react/use-state': ['error', { enforceSetterName: false }],
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

  // Official React Compiler + hooks rules; oxlint owns all but config/gating.
  {
    extends: [reactHooks.configs.flat['recommended-latest']],
    files: ['**/*.{ts,tsx}'],
  },
];
