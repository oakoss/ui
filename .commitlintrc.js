import { defineConfig } from 'czg';

// Single source of truth: drives both the czg prompt and the enforced
// scope-enum rule below.
const scopes = [
  'components',
  'tokens',
  'theme',
  'hooks',
  'utils',
  'a11y',
  'tests',
  'docs',
  'deps',
  'tooling',
  'ci',
];

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  prompt: {
    alias: {
      ci: 'ci: update workflows',
      deps: 'chore(deps): bump dependencies',
      docs: 'docs: update docs',
    },
    allowCustomScopes: false,
    allowEmptyScopes: true,
    scopes,
    skipQuestions: ['breaking', 'footer', 'issues'],
  },
  rules: {
    'body-max-line-length': [0, 'always'],
    'footer-max-line-length': [0, 'always'],
    'header-max-length': [2, 'always', 200],
    'scope-enum': [2, 'always', scopes],
  },
});
