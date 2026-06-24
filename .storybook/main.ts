import type { StorybookConfig } from '@storybook/react-vite';

import path from 'node:path';

const config: StorybookConfig = {
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite');
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      // Vite resolves package.json `imports` first but can't follow its array
      // fallback, so `.ts`-only `#/` imports need this alias to override.
      resolve: { alias: { '#': path.resolve(import.meta.dirname, '../src') } },
    });
  },
};

export default config;
