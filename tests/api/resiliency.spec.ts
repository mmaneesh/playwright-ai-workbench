import { test, expect } from '@fixtures';
import { z } from 'zod';
import { ErrorResponseSchema } from '../../types/schemas/error.schema';

const DelayResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    requestedDelayMs: z.number(),
    appliedDelayMs: z.number(),
    actualDelayMs: z.number(),
    method: z.string(),
  }),
});

test(
  'GET /v1/simulate/delay/{ms} validates server latency handling contract',
  { tag: '@api' },
  async ({ request }) => {
    let body: unknown;
    const startTime = Date.now();

    await test.step('Send request with simulated 300ms server delay', async () => {
      const response = await request.get('/v1/simulate/delay/300');
      expect(response.status()).toBe(200);
      body = await response.json();
    });

    await test.step('Assert delay contract and elapsed client execution time', async () => {
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(250);

      const parsed = DelayResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.requestedDelayMs).toBe(300);
    });
  }
);

test(
  'GET /v1/simulate/status/429 validates simulated rate limiting error contract',
  { tag: '@api' },
  async ({ request }) => {
    let body: unknown;

    await test.step('Request simulated 429 Too Many Requests response', async () => {
      const response = await request.get('/v1/simulate/status/429');
      expect(response.status()).toBe(429);
      body = await response.json();
    });

    await test.step('Validate 429 error envelope against ErrorResponseSchema', async () => {
      const parsed = ErrorResponseSchema.parse(body);
      expect(parsed.success).toBe(false);
      expect(parsed.error.code).toBe('SIMULATED_ERROR');
    });
  }
);
