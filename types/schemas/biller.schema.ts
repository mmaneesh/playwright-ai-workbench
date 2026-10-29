import { z } from 'zod';
import { MetaSchema, PaginationSchema } from './common.schema';

export const BillerSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  category: z.string(),
  logoUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  supportedPaymentModes: z.array(z.string()).optional(),
  fetchBillSupported: z.boolean().optional(),
  partialPaymentAllowed: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  customerIdLabel: z.string().nullable().optional(),
  customerIdPattern: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const BillerListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BillerSchema),
  meta: MetaSchema.optional(),
  pagination: PaginationSchema.optional(),
});

export const BillerSingleResponseSchema = z.object({
  success: z.boolean(),
  data: BillerSchema,
  meta: MetaSchema.optional(),
});

export const CategoryItemSchema = z.object({
  category: z.string(),
  count: z.number().optional(),
  displayName: z.string().optional(),
});

export const CategoriesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CategoryItemSchema),
  meta: MetaSchema.optional(),
});

export type Biller = z.infer<typeof BillerSchema>;
export type BillerListResponse = z.infer<typeof BillerListResponseSchema>;
export type BillerSingleResponse = z.infer<typeof BillerSingleResponseSchema>;
export type CategoryItem = z.infer<typeof CategoryItemSchema>;
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;
