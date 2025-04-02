import z from 'zod';

export const verifyEmailResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const emailPayloadSchema = z.object({
  userEmail: z.string(),
});

export const verifyEmailQuery = z.object({
  token: z.string(),
});

export const verifyEmailResponseSchema = z.object({
  message: z.string(),
});

export type verifyEmailResult = z.infer<typeof verifyEmailResultSchema>;
export type emailPayload = z.infer<typeof emailPayloadSchema>;
export type verifyEmailResponse = z.infer<typeof verifyEmailResponseSchema>;
