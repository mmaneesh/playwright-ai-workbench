import { z } from 'zod';
import { MetaSchema } from './common.schema';

export const UploadedFileSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export const FileUploadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    file: UploadedFileSchema,
    url: z.string().optional(),
    checksum: z
      .object({
        algorithm: z.string().optional(),
        value: z.string().optional(),
      })
      .optional(),
  }),
  meta: MetaSchema.optional(),
});

export type UploadedFile = z.infer<typeof UploadedFileSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
