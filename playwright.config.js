import { defineConfig, devices } from '@playwright/test';

// CI runs all three engines. Locally: BROWSERS=chromium,webkit,firefox npm run test:e2e
const browsers = (process.env.BROWSERS ?? (process.env.CI ? 'chromium,webkit,firefox' : 'chromium')).split(',');
const PROJECTS = {
  chromium: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' },
  webkit: { ...devices['Desktop Safari'] },
  firefox: { ...devices['Desktop Firefox'] },
};

const local = 'http://127.0.0.1:4173/dual-wallet-prototype/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  use: { baseURL: process.env.BASE_URL ?? local },
  projects: browsers.map(name => ({ name, use: PROJECTS[name] })),
  webServer: process.env.BASE_URL ? undefined : { command: 'node scripts/serve.mjs', url: local, reuseExistingServer: false },
});
