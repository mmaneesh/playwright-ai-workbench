import { test, expect } from '@fixtures';
import {
  BillerListResponseSchema,
  BillerSingleResponseSchema,
} from '../../types/schemas/biller.schema';

test(
  'GET /v1/billers filters catalog by category with pagination',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;

    await test.step('Send GET request for telecom billers with limit', async () => {
      const response = await authedRequest.get('/v1/billers', {
        params: {
          category: 'telecom',
          limit: 5,
        },
      });
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Validate response schema and category consistency', async () => {
      const parsed = BillerListResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.length).toBeGreaterThan(0);
      expect(parsed.data.every((biller) => biller.category === 'telecom')).toBe(true);
    });
  }
);

test(
  'GET /v1/billers/:id retrieves single biller details',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;

    await test.step('Fetch single known biller', async () => {
      const response = await authedRequest.get('/v1/billers/biller-airtel-postpaid');
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Validate single biller contract', async () => {
      const parsed = BillerSingleResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.id).toBe('biller-airtel-postpaid');
      expect(parsed.data.isActive).toBe(true);
    });
  }
);
