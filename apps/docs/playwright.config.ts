import { defineConfig, devices } from '@playwright/test';

const port = 4320;
const isCi = process.env.CI !== undefined && process.env.CI !== '';

export default defineConfig({
  forbidOnly: isCi,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: isCi ? 'github' : 'list',
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${port}` },
  webServer: {
    command: 'node e2e/serve.ts',
    env: { PORT: String(port) },
    reuseExistingServer: !isCi,
    url: `http://localhost:${port}`,
  },
});
