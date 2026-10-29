import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../tests/ui',
  outputDir: '../test-results/ui',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 30_000,
  reporter: [['list'], ['html', { outputFolder: '../playwright-report/ui', open: 'never' }]],
  use: {
    baseURL: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/*.setup.ts', '**/*.authenticated.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/*.setup.ts', '**/*.authenticated.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/*.setup.ts', '**/*.authenticated.spec.ts'],
    },
    // Logs in once, saves the session; everything tagged *.authenticated.spec.ts reuses
    // it instead of re-logging-in per test. storageState is just serialized cookies/
    // origin storage, so one login run covers all three browser-authenticated projects.
    { name: 'setup', testMatch: '**/*.setup.ts' },
    {
      name: 'chromium-authenticated',
      testMatch: '**/*.authenticated.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    },
    {
      name: 'firefox-authenticated',
      testMatch: '**/*.authenticated.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/user.json' },
    },
    {
      name: 'webkit-authenticated',
      testMatch: '**/*.authenticated.spec.ts',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/user.json' },
    },
  ],
});
