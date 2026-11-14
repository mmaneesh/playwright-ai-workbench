import { test, expect } from '@fixtures';
import { BillerListResponseSchema } from '../../types/schemas/biller.schema';
import { BillSingleResponseSchema } from '../../types/schemas/bill.schema';
import {
  PaymentMethodResponseSchema,
  PaymentResponseSchema,
} from '../../types/schemas/payment.schema';

test(
  'end-to-end response chaining: discover biller -> create bill -> verify payment method -> execute payment -> verify bill paid status',
  { tag: '@api' },
  async ({ authedRequest, isolatedUser }) => {
    let billerId = '';
    let billId = '';
    let paymentId = '';
    const { userId, paymentMethodId } = isolatedUser;
    const billAmount = 499;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    await test.step('Discover available billers and select an active provider', async () => {
      const response = await authedRequest.get('/v1/billers', { params: { limit: 1 } });
      expect(response.status()).toBe(200);

      const parsed = BillerListResponseSchema.parse(await response.json());
      expect(parsed.data.length).toBeGreaterThan(0);
      billerId = parsed.data[0].id;
      expect(billerId).toBeTruthy();
    });

    await test.step('Create a new pending bill for the isolated user', async () => {
      const response = await authedRequest.post('/v1/bills', {
        data: {
          userId,
          billerId,
          customerIdentifier: '9876543210',
          customerName: 'Workbench Automation User',
          amount: billAmount,
          dueDate,
        },
      });

      expect(response.status()).toBe(201);
      const parsed = BillSingleResponseSchema.parse(await response.json());
      expect(parsed.success).toBe(true);
      expect(parsed.data.status).toBe('pending');
      billId = parsed.data.id;
      expect(billId).toBeTruthy();
    });

    await test.step("Verify the isolated user's payment method is active", async () => {
      // /v1/payment-methods?userId=... does not filter server-side (verified
      // live against the real API), so the list endpoint can't be trusted to
      // scope by user. Fetching by id, as created in the isolatedUser fixture,
      // is the only reliable way to confirm it is still active before paying.
      const response = await authedRequest.get(`/v1/payment-methods/${paymentMethodId}`);
      expect(response.status()).toBe(200);

      const parsed = PaymentMethodResponseSchema.parse(await response.json());
      expect(parsed.data.userId).toBe(userId);
      expect(parsed.data.isActive).toBe(true);
    });

    await test.step('Execute payment for the newly created bill', async () => {
      const response = await authedRequest.post('/v1/payments', {
        data: {
          billId,
          amount: billAmount,
          paymentMethodId,
        },
      });

      expect([200, 201]).toContain(response.status());
      const parsed = PaymentResponseSchema.parse(await response.json());
      expect(parsed.success).toBe(true);
      expect(parsed.data.billId).toBe(billId);
      paymentId = parsed.data.id;
      expect(paymentId).toBeTruthy();
    });

    await test.step('Verify that the bill status has transitioned to paid', async () => {
      // Payment processing is asynchronous: the bill briefly stays "pending" after
      // the payment call returns. Poll instead of asserting once (no hard sleep).
      await expect
        .poll(
          async () => {
            const response = await authedRequest.get(`/v1/bills/${billId}`);
            expect(response.status()).toBe(200);
            const parsed = BillSingleResponseSchema.parse(await response.json());
            expect(parsed.success).toBe(true);
            return parsed.data.status;
          },
          { message: 'Expected bill status to transition to paid', timeout: 10_000 }
        )
        .toBe('paid');
    });

    await test.step('Retrieve and validate the final payment transaction receipt', async () => {
      const response = await authedRequest.get(`/v1/payments/${paymentId}`);
      expect(response.status()).toBe(200);

      const parsed = PaymentResponseSchema.parse(await response.json());
      expect(parsed.success).toBe(true);
      expect(parsed.data.id).toBe(paymentId);
      expect(parsed.data.status).toBe('completed');
    });
  }
);
