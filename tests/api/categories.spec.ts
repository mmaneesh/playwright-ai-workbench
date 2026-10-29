import { test, expect } from '@fixtures';
import { CategoriesResponseSchema } from '../../types/schemas/biller.schema';

test(
  'GET /v1/billers/categories validates reference categories contract',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;

    await test.step('Send authenticated request for biller categories', async () => {
      const response = await authedRequest.get('/v1/billers/categories');
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Validate response structure against CategoriesResponseSchema', async () => {
      const parsed = CategoriesResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.length).toBeGreaterThan(0);
      const categoryNames = parsed.data.map((item) => item.category);
      expect(categoryNames).toContain('telecom');
      expect(categoryNames).toContain('electricity');
    });
  }
);
