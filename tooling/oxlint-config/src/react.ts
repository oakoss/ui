import { defineConfig } from 'oxlint';

export default defineConfig({
  overrides: [
    { files: ['**/*.{ts,tsx}'], rules: { 'react/unsupported-syntax': 'warn' } },
    {
      files: ['**/*.tsx'],
      plugins: ['react', 'jsx-a11y'],
      rules: {
        'jsx-a11y/control-has-associated-label': 'off',
        // Empty options replace oxlint's recommended-preset allowlists (strict).
        'jsx-a11y/no-interactive-element-to-noninteractive-role': ['error', {}],
        'jsx-a11y/no-noninteractive-element-to-interactive-role': ['error', {}],
        'jsx-a11y/no-noninteractive-tabindex': [
          'error',
          { roles: [], tags: [] },
        ],
        // Context-dependent implicit roles; oxlint ignores context and --fix
        // would strip them.
        'jsx-a11y/no-redundant-roles': [
          'error',
          {
            a: ['link'],
            td: ['cell', 'gridcell'],
            th: ['columnheader', 'gridcell', 'rowheader'],
          },
        ],
        'jsx-a11y/no-static-element-interactions': [
          'error',
          {
            handlers: [
              'onFocus',
              'onBlur',
              'onKeyDown',
              'onKeyPress',
              'onKeyUp',
              'onClick',
              'onContextMenu',
              'onDblClick',
              'onDoubleClick',
              'onDrag',
              'onDragEnd',
              'onDragEnter',
              'onDragExit',
              'onDragLeave',
              'onDragOver',
              'onDragStart',
              'onDrop',
              'onMouseDown',
              'onMouseEnter',
              'onMouseLeave',
              'onMouseMove',
              'onMouseOut',
              'onMouseOver',
              'onMouseUp',
            ],
          },
        ],
        'jsx-a11y/prefer-tag-over-role': 'off',
        'react/button-has-type': 'error',
        'react/hook-use-state': 'error',
        'react/jsx-no-constructed-context-values': 'off',
        'react/jsx-no-useless-fragment': 'off',
        'react/no-clone-element': 'error',
        'react/no-danger': 'off',
        'react/no-react-children': 'error',
        'react/no-unsafe': 'off',
        'react/prefer-function-component': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/self-closing-comp': 'error',
      },
    },
  ],
  plugins: ['react', 'jsx-a11y'],
  rules: {
    'react/exhaustive-deps': 'warn',
    'react/exhaustive-effect-dependencies': 'off',
    'react/memo-dependencies': 'off',
  },
  settings: {
    'jsx-a11y': {
      components: { Button: 'button', Input: 'input', Select: 'select' },
    },
  },
});
