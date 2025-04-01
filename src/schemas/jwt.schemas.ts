import z from 'zod';

const tokenPayloadSchema = z.object({
  userId: z.string(),
  userEmail: z.string(),
  isAdmin: z.boolean(),
});

export const tokenOptionSchema = z.object({
  expiresIn: z.string(),
});

export const refreshTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.date(),
  ipAddress: z.string(),
  userId: z.string(),
});

export type refreshToken = z.infer<typeof refreshTokenSchema>;
export type tokenPayload = z.infer<typeof tokenPayloadSchema>;
export type tokenOption = z.infer<typeof tokenOptionSchema>;
