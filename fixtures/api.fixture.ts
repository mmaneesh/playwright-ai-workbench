import 'dotenv/config';
import { test as base, type APIRequestContext } from '@playwright/test';
import { UserResponseSchema } from '../types/schemas/user.schema';
import { PaymentMethodResponseSchema } from '../types/schemas/payment.schema';

type IsolatedUser = {
  userId: string;
  paymentMethodId: string;
};

type ApiFixtures = {
  authedRequest: APIRequestContext;
  isolatedUser: IsolatedUser;
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

  // A dedicated user + payment method created per test run, never shared with
  // other runs or other tests. Verified live: DELETE on /v1/bills is 405
  // (unsupported), and DELETE on /v1/users or /v1/payment-methods is blocked
  // by referential integrity (409) while a bill exists against them - so
  // nothing created here can ever be torn down. Isolation instead comes from
  // never touching shared records (e.g. user-demo-001) in the first place.
  isolatedUser: async ({ authedRequest }, use, testInfo) => {
    const runId = `${testInfo.testId}-${Date.now()}`;

    const userResponse = await authedRequest.post('/v1/users', {
      data: {
        firstName: 'Workbench',
        lastName: 'Isolation',
        email: `${runId}@workbench.test`,
      },
    });
    const user = UserResponseSchema.parse(await userResponse.json());

    const paymentMethodResponse = await authedRequest.post('/v1/payment-methods', {
      data: {
        userId: user.data.id,
        type: 'upi',
        displayName: 'Workbench Isolation UPI',
        upiId: `${runId}@okaxis`,
        isDefault: true,
      },
    });
    const paymentMethod = PaymentMethodResponseSchema.parse(await paymentMethodResponse.json());

    await use({ userId: user.data.id, paymentMethodId: paymentMethod.data.id });
  },
});

export { expect } from '@playwright/test';
