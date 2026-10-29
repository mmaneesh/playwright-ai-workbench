import { z } from 'zod';
import { MetaSchema } from './common.schema';
import { MoneySchema } from './bill.schema';

export const PaymentMethodSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  displayName: z.string(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const PaymentMethodListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PaymentMethodSchema),
  meta: MetaSchema.optional(),
});

export const PaymentSchema = z.object({
  id: z.string(),
  billId: z.string(),
  userId: z.string().optional(),
  amount: z.union([MoneySchema, z.number()]),
  status: z.string(),
  paymentMethodId: z.string().optional(),
  transactionId: z.string().optional(),
  processedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export const PaymentResponseSchema = z.object({
  success: z.boolean(),
  data: PaymentSchema,
  meta: MetaSchema.optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentMethodListResponse = z.infer<typeof PaymentMethodListResponseSchema>;
