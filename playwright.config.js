import { defineConfig } from '@playwright/test';

const local = 'http://127.0.0.1:4173/dual-wallet-prototype/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  use: { baseURL: process.env.BASE_URL ?? local, channel: process.env.CI ? undefined : 'chrome' },
  webServer: process.env.BASE_URL ? undefined : { command: 'node scripts/serve.mjs', url: local, reuseExistingServer: false },
});
