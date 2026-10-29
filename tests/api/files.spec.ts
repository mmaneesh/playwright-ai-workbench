import { test, expect } from '@fixtures';
import { FileUploadResponseSchema } from '../../types/schemas/file.schema';

test(
  'POST /v1/files/upload uploads binary document via multipart form data',
  { tag: '@api' },
  async ({ authedRequest }) => {
    let body: unknown;
    const fileContent = Buffer.from(
      '%PDF-1.4 synthetic kyc document content for automated testing'
    );

    await test.step('Submit multipart file upload request with metadata', async () => {
      const response = await authedRequest.post('/v1/files/upload', {
        multipart: {
          file: {
            name: 'id-verification.pdf',
            mimeType: 'application/pdf',
            buffer: fileContent,
          },
          description: 'Automated KYC verification document',
          category: 'identity',
        },
      });
      expect(response.status()).toBe(201);
      body = await response.json();
    });

    await test.step('Validate file upload response contract against FileUploadResponseSchema', async () => {
      const parsed = FileUploadResponseSchema.parse(body);
      expect(parsed.success).toBe(true);
      expect(parsed.data.file.id).toBeDefined();
      expect(parsed.data.file.originalName).toBe('id-verification.pdf');
      expect(parsed.data.file.mimeType).toBe('application/pdf');
      expect(parsed.data.file.size).toBe(fileContent.length);
    });
  }
);
