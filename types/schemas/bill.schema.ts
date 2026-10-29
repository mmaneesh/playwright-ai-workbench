import { z } from 'zod';
import { MetaSchema, PaginationSchema } from './common.schema';

export const MoneySchema = z.object({
  value: z.number(),
  currency: z.string().default('INR'),
});

export const BillSchema = z.object({
  id: z.string(),
  userId: z.string(),
  billerId: z.string(),
  billerName: z.string().nullable().optional(),
  billerCategory: z.string().nullable().optional(),
  customerIdentifier: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  amount: z.union([MoneySchema, z.number()]),
  dueDate: z.string().nullable().optional(),
  billDate: z.string().nullable().optional(),
  billPeriod: z.string().nullable().optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'processing', 'failed', 'cancelled']),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const BillListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BillSchema),
  meta: MetaSchema.optional(),
  pagination: PaginationSchema.optional(),
});

export const BillSingleResponseSchema = z.object({
  success: z.boolean(),
  data: BillSchema,
  meta: MetaSchema.optional(),
});

export type Money = z.infer<typeof MoneySchema>;
export type Bill = z.infer<typeof BillSchema>;
export type BillListResponse = z.infer<typeof BillListResponseSchema>;
export type BillSingleResponse = z.infer<typeof BillSingleResponseSchema>;
