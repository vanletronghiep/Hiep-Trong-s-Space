import { z } from 'zod';

export const storageDriverSchema = z.enum(['local', 'drive']);
export type StorageDriver = z.infer<typeof storageDriverSchema>;

export const healthResponseSchema = z.object({
  ok: z.literal(true),
  storage: storageDriverSchema,
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
