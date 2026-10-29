import { test, expect } from '@fixtures';
import { BillerListResponseSchema } from '../../types/schemas/biller.schema';
import { BillSingleResponseSchema } from '../../types/schemas/bill.schema';
import {
  PaymentMethodListResponseSchema,
  PaymentResponseSchema,
} from '../../types/schemas/payment.schema';

test(
  'end-to-end response chaining: discover biller -> create bill -> fetch payment method -> execute payment -> verify bill paid status',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let billerId = '';
    let billId = '';
    let paymentMethodId = '';
    let paymentId = '';
    const billAmount = 499;

    await test.step('Discover available billers and select an active provider', async () => {
      const response = await authedRequest.get('/v1/billers', { params: { limit: 1 } });
      expect(response.status()).toBe(200);

      const parsed = BillerListResponseSchema.parse(await response.json());
      expect(parsed.data.length).toBeGreaterThan(0);
      billerId = parsed.data[0].id;
      expect(billerId).toBeTruthy();
    });

    await test.step('Create a new pending bill for the selected biller', async () => {
      const response = await authedRequest.post('/v1/bills', {
        data: {
          userId: 'user-demo-001',
          billerId,
          customerIdentifier: '9876543210',
          customerName: 'Workbench Automation User',
          amount: billAmount,
          dueDate: '2026-12-31',
        },
      });

      expect(response.status()).toBe(201);
      const parsed = BillSingleResponseSchema.parse(await response.json());
      expect(parsed.success).toBe(true);
      expect(parsed.data.status).toBe('pending');
      billId = parsed.data.id;
      expect(billId).toBeTruthy();
    });

    await test.step('Fetch active payment methods for the user', async () => {
      const response = await authedRequest.get('/v1/payment-methods', {
        params: { userId: 'user-demo-001' },
      });
      expect(response.status()).toBe(200);

      const parsed = PaymentMethodListResponseSchema.parse(await response.json());
      expect(parsed.data.length).toBeGreaterThan(0);
      paymentMethodId = parsed.data[0].id;
      expect(paymentMethodId).toBeTruthy();
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
