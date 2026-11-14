import { z } from 'zod';
import { MetaSchema } from './common.schema';

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  kycStatus: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const UserResponseSchema = z.object({
  success: z.boolean(),
  data: UserSchema,
  meta: MetaSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
