import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

// Auth projects stay dormant unless real test credentials are configured, so the
// default public-demo suites (which need no login) are never affected.
const hasAuthCredentials = Boolean(process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD);

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
    baseURL: process.env.UI_BASE_URL || 'https://storedemo.testdino.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/\.setup\.ts/, /\.authenticated\.spec\.ts/],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: [/\.setup\.ts/, /\.authenticated\.spec\.ts/],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: [/\.setup\.ts/, /\.authenticated\.spec\.ts/],
    },
    ...(hasAuthCredentials
      ? [
          { name: 'setup', testMatch: /\.setup\.ts/ },
          {
            name: 'chromium-authenticated',
            testMatch: /\.authenticated\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
          },
        ]
      : []),
  ],
});
