import { z } from 'zod';

export const ErrorDetailSchema = z.object({
  field: z.string().optional(),
  code: z.string().optional(),
  message: z.string(),
});

export const ErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  traceId: z.string().optional(),
  timestamp: z.string().optional(),
  details: z.array(ErrorDetailSchema).optional(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ErrorBodySchema,
});

export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorBody = z.infer<typeof ErrorBodySchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
