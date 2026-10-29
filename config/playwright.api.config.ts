import 'dotenv/config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/api',
  outputDir: '../test-results/api',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 30_000,
  reporter: [['list'], ['html', { outputFolder: '../playwright-report/api', open: 'never' }]],
  use: {
    baseURL:
      process.env.API_BASE_URL || 'https://billpay-api.gauravkhurana-practice-api.workers.dev',
    trace: 'retain-on-failure',
  },
});
