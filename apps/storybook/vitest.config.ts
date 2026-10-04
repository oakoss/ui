import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// The CLI and CI run, and axe-check, every story in both themes, plus stories
// tagged forced-colors under Windows High Contrast emulation. Storybook's test
// panel gets light only: it names every project after the config directory,
// so two projects collide.
const isPanel = process.env.VITEST_STORYBOOK === 'true';

const projects = [
  { name: 'light', theme: 'light' },
  ...(isPanel
    ? []
    : [
        { name: 'dark', theme: 'dark' },
        { forcedColors: true, name: 'forced-colors', theme: 'light' },
      ]),
];

export default defineConfig({
  test: {
    projects: projects.map(({ forcedColors = false, name, theme }) => ({
      define: { 'import.meta.env.VITE_STORY_THEME': JSON.stringify(theme) },
      plugins: [
        storybookTest({
          configDir: path.join(import.meta.dirname, '.storybook'),
          tags: forcedColors
            ? { include: ['forced-colors'] }
            : { exclude: ['forced-colors'] },
        }),
      ],
      test: {
        browser: {
          enabled: true,
          headless: true,
          instances: [{ browser: 'chromium' }],
          provider: playwright(
            forcedColors ? { contextOptions: { forcedColors: 'active' } } : {},
          ),
        },
        name,
      },
    })),
  },
});
