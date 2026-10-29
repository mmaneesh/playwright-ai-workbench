import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/audit',
  outputDir: '../test-results/audit',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  timeout: 30_000,
  reporter: [['list'], ['html', { outputFolder: '../playwright-report/audit', open: 'never' }]],
  use: {
    baseURL: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'audit-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
