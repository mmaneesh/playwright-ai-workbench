import { test, expect } from '@fixtures';
import { BillListResponseSchema, BillSingleResponseSchema } from '../../types/schemas/bill.schema';

test(
  'GET /v1/bills retrieves user bills matching query filter',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;

    await test.step('Query bills for demo user', async () => {
      const response = await authedRequest.get('/v1/bills', {
        params: {
          userId: 'user-demo-001',
          limit: 10,
        },
      });
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Validate bills list schema contract', async () => {
      const parsed = BillListResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(Array.isArray(parsed.data)).toBe(true);
    });
  }
);

test(
  'GET /v1/bills/:id retrieves single bill contract',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;

    await test.step('Fetch single existing bill', async () => {
      const response = await authedRequest.get('/v1/bills/bill-001');
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Validate single bill schema contract', async () => {
      const parsed = BillSingleResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.id).toBe('bill-001');
      expect(parsed.data.userId).toBe('user-demo-001');
    });
  }
);
