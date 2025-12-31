import { defineConfig } from 'cz-git';

export default defineConfig({
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New features
        'fix', // Bug fixes
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc.)
        'refactor', // Code changes that neither fix bugs nor add features
        'perf', // Performance improvements
        'test', // Adding or correcting tests
        'chore', // Dependencies, tooling, etc.
        'ci', // CI configuration changes
        'revert', // Revert a previous commit
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 200],
    'body-max-length': [2, 'always', Infinity],
    'body-max-line-length': [0, 'always'],
  },
  prompt: {
    alias: {
      b: 'chore(deps): :hammer: bump dependencies',
      ud: 'docs(repo): :memo: update documentation',
    },
    useEmoji: true,
    scopes: [
      // Registry components
      'ui', // UI components (button, dialog, etc.)
      'hooks', // Custom hooks (use-media-query, etc.)
      'lib', // Utilities (cn, etc.)
      'blocks', // Composed patterns (login-form, etc.)
      // Apps
      'docs', // Documentation site
      // Packages
      'eslint', // ESLint config package
      'tsconfig', // TypeScript config package
      // Infrastructure
      'registry', // Registry build/generation
      'config', // Root config files
      'deps', // Dependencies
      'repo', // Repository-wide changes
    ],
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    skipQuestions: [],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
  },
});
