import { defineConfig, devices } from '@playwright/test';

const port = 4320;
const isCi = process.env.CI !== undefined && process.env.CI !== '';

export default defineConfig({
  forbidOnly: isCi,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The docs shell changes below md and xl, so every page is checked at a
    // phone's width too. Colors don't change with width: light only.
    {
      grep: /light theme passes axe on/u,
      name: 'phone',
      testMatch: 'a11y.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { height: 812, width: 375 },
      },
    },
  ],
  reporter: isCi ? 'github' : 'list',
  retries: isCi ? 1 : 0,
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: 'node e2e/serve.ts',
    env: { PORT: String(port) },
    reuseExistingServer: !isCi,
    url: `http://localhost:${port}`,
  },
});
