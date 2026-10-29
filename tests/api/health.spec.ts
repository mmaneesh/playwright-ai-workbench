import { test, expect } from '@fixtures';
import { HealthResponseSchema } from '../../types/schemas/health.schema';

test(
  'GET /health validates server health contract without authentication',
  { tag: '@api' },
  async ({ request }) => {
    let body: unknown;

    await test.step('Send unauthenticated GET request to /health', async () => {
      const response = await request.get('/health');
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Validate payload against HealthResponseSchema', async () => {
      const parsed = HealthResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.status).toBe('healthy');
      expect(parsed.data.service).toBe('billpay-api');
    });
  }
);
