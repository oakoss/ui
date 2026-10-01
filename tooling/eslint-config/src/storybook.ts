import storybookPlugin from 'eslint-plugin-storybook';

export function storybook({ packageJson }: { readonly packageJson: string }) {
  return [
    ...storybookPlugin.configs['flat/recommended'],
    {
      files: ['.storybook/main.@(js|cjs|mjs|ts)'],
      rules: {
        'storybook/no-uninstalled-addons': [
          'error',
          { packageJsonLocation: packageJson },
        ],
      },
    },
  ];
}
