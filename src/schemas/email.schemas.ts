import z from 'zod';

export const VerifyEmailResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const EmailTokenPayloadSchema = z.object({
  userEmail: z.string(),
});

export const ResendEmailRequestSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
});

export const VerifyEmailQuery = z.object({
  token: z.string(),
});

export const VerifyEmailResponseSchema = z.object({
  message: z.string(),
});

export type VerifyEmailResult = z.infer<typeof VerifyEmailResultSchema>;
export type EmailTokenPayload = z.infer<typeof EmailTokenPayloadSchema>;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;
export type ResendEmailRequest = z.infer<typeof ResendEmailRequestSchema>;
