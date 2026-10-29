import { z } from 'zod';
import { MetaSchema } from './common.schema';

export const HealthDataSchema = z.object({
  status: z.string(),
  service: z.string(),
  version: z.string(),
  timestamp: z.string(),
});

export const HealthResponseSchema = z.object({
  success: z.boolean(),
  data: HealthDataSchema,
  meta: MetaSchema.optional(),
});

export type HealthData = z.infer<typeof HealthDataSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
