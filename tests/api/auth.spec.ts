import { test, expect } from '@fixtures';
import { ErrorResponseSchema } from '../../types/schemas/error.schema';

test(
  'unauthenticated request returns 401 with standard ErrorSchema',
  { tag: '@api' },
  async ({ request }) => {
    let body: unknown;

    await test.step('Send GET /v1/billers without authentication headers', async () => {
      const response = await request.get('/v1/billers');
      expect(response.status()).toBe(401);
      body = await response.json();
    });

    await test.step('Validate error envelope against ErrorResponseSchema', async () => {
      const parsed = ErrorResponseSchema.parse(body);
      expect(parsed.success).toBe(false);
      expect(parsed.error.code).toBeDefined();
    });
  }
);

test('invalid Bearer token returns 401 with ErrorSchema', { tag: '@api' }, async ({ request }) => {
  let body: unknown;

  await test.step('Send request with invalid Bearer token header', async () => {
    const response = await request.get('/v1/billers', {
      headers: {
        Authorization: 'Bearer malformed-token-xyz',
      },
    });
    expect(response.status()).toBe(401);
    body = await response.json();
  });

  await test.step('Validate 401 error structure', async () => {
    const parsed = ErrorResponseSchema.parse(body);
    expect(parsed.success).toBe(false);
    expect(parsed.error.code).toBe('INVALID_TOKEN');
  });
});

test(
  'non-existent resource returns 404 with ErrorSchema',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;

    await test.step('Request non-existent biller ID', async () => {
      const response = await authedRequest.get('/v1/billers/non-existent-biller-99999');
      expect(response.status()).toBe(404);
      body = await response.json();
    });

    await test.step('Validate 404 error envelope structure', async () => {
      const parsed = ErrorResponseSchema.parse(body);
      expect(parsed.success).toBe(false);
      expect(parsed.error.message).toBeDefined();
    });
  }
);
