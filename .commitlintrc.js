import { RuleConfigSeverity } from '@commitlint/types';
import createPreset from 'conventional-changelog-conventionalcommits';
import { definePrompt } from 'czg';

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

// For type-aware oxlint: czg's defineConfig bundles a private copy of
// RuleConfigSeverity, so commitlint's types stand in.
/**
@type {import('@commitlint/types').UserConfig & { prompt?: import('czg').CommitizenGitOptions }}
*/
export default {
  extends: ['@commitlint/config-conventional'],
  // `Closes ui-xxx` is a bead reference, so it starts the footer.
  parserPreset: {
    parserOpts: createPreset({ issuePrefixes: ['#', 'ui-'] }).parser,
  },
  prompt: definePrompt({
    alias: {
      ci: 'ci: update workflows',
      deps: 'chore(deps): bump dependencies',
      docs: 'docs: update docs',
    },
    allowCustomScopes: false,
    allowEmptyScopes: true,
    scopes,
    skipQuestions: ['breaking', 'footer', 'issues'],
  }),
  rules: {
    'body-max-line-length': [RuleConfigSeverity.Disabled, 'always'],
    // A wrapped body line starting with `word:` opens a footer; fail so it gets rewrapped.
    'footer-leading-blank': [RuleConfigSeverity.Error, 'always'],
    'footer-max-line-length': [RuleConfigSeverity.Disabled, 'always'],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 200],
    'scope-enum': [RuleConfigSeverity.Error, 'always', scopes],
  },
};
