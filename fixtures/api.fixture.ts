import 'dotenv/config';
import { test as base, type APIRequestContext } from '@playwright/test';

type ApiFixtures = {
  authedRequest: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  authedRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL:
        process.env.API_BASE_URL || 'https://billpay-api.gauravkhurana-practice-api.workers.dev',
      extraHTTPHeaders: {
        'X-API-Key': process.env.API_KEY || 'demo-api-key-123',
        Accept: 'application/json',
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
