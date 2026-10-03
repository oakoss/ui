import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// The CLI and CI run, and axe-check, every story in both themes. Storybook's
// test panel gets light only: it names every project after the config
// directory, so two projects collide.
const themes =
  process.env.VITEST_STORYBOOK === 'true'
    ? (['light'] as const)
    : (['light', 'dark'] as const);

export default defineConfig({
  test: {
    projects: themes.map((theme) => ({
      define: { 'import.meta.env.VITE_STORY_THEME': JSON.stringify(theme) },
      plugins: [
        storybookTest({
          configDir: path.join(import.meta.dirname, '.storybook'),
        }),
      ],
      test: {
        browser: {
          enabled: true,
          headless: true,
          instances: [{ browser: 'chromium' }],
          provider: playwright({}),
        },
        name: theme,
      },
    })),
  },
});
