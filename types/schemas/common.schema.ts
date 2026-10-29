import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
  offset: z.number().optional(),
});

export const MetaSchema = z.object({
  requestId: z.string().optional(),
  timestamp: z.string().optional(),
  version: z.string().optional(),
  pagination: PaginationSchema.optional(),
});

export type Meta = z.infer<typeof MetaSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
