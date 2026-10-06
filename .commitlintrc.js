import createPreset from 'conventional-changelog-conventionalcommits';
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
  // oakum's version PR: `chore(release): version packages`.
  'release',
];

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  // `Closes ui-xxx` is a bead reference, so it starts the footer.
  parserPreset: {
    parserOpts: createPreset({ issuePrefixes: ['#', 'ui-'] }).parser,
  },
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
    // A wrapped body line starting with `word:` opens a footer; fail so it gets rewrapped.
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [0, 'always'],
    'header-max-length': [2, 'always', 200],
    'scope-enum': [2, 'always', scopes],
  },
});
