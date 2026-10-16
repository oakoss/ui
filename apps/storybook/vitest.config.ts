import type { BrowserCommand } from 'vitest/node';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Hover checks run only while the pointer is in the viewport, so parking it
// outside leaves nothing hovered; Playwright parks a reused page at (-1, -1).
const movePointerOffscreen: BrowserCommand = ({ page }) =>
  page.mouse.move(-10, -10);

const emulateReducedMotion: BrowserCommand<[isReduced: boolean]> = (
  { page },
  isReduced,
) =>
  page.emulateMedia({ reducedMotion: isReduced ? 'reduce' : 'no-preference' });

// The CLI and CI run, and axe-check, every story in both themes, plus stories
// tagged forced-colors under Windows High Contrast emulation, in its light and
// dark palettes. Storybook's test panel gets light only: it names every project
// after the config directory, so two projects collide.
const isPanel = process.env.VITEST_STORYBOOK === 'true';
const isCI = process.env.CI === 'true';

type Project = {
  forcedColors?: boolean;
  name: string;
  theme: 'dark' | 'light';
};

const panelProjects: Project[] = [{ name: 'light', theme: 'light' }];
const projects: Project[] = isPanel
  ? panelProjects
  : [
      ...panelProjects,
      { name: 'dark', theme: 'dark' },
      { forcedColors: true, name: 'forced-colors', theme: 'light' },
      { forcedColors: true, name: 'forced-colors-dark', theme: 'dark' },
    ];

export default defineConfig({
  test: {
    // CI runs story files one at a time, one project after another: on a
    // shared runner, parallel browser files starve each other's timers.
    fileParallelism: !isCI,
    projects: projects.map(({ forcedColors = false, name, theme }, index) => ({
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
          commands: { emulateReducedMotion, movePointerOffscreen },
          enabled: true,
          // Visual runs (VITE_VISUAL) write one image per story and project.
          expect: {
            toMatchScreenshot: {
              resolveScreenshotPath: ({ arg, ext, project, root }) =>
                path.join(
                  root,
                  '.visual',
                  project.name.split(' ', 1)[0] ?? project.name,
                  `${arg}${ext}`,
                ),
            },
          },
          headless: true,
          instances: [{ browser: 'chromium' }],
          // Chromium picks the forced palette from the color scheme.
          provider: playwright(
            forcedColors
              ? {
                  contextOptions: {
                    colorScheme: theme,
                    forcedColors: 'active',
                  },
                }
              : {},
          ),
        },
        name,
        retry: isCI ? 1 : 0,
        ...(isCI && { sequence: { groupOrder: index } }),
      },
    })),
    // A failing story's console output reaches the CI log.
    silent: 'passed-only',
  },
});
