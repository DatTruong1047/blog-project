import z from 'zod';

const TokenPayloadSchema = z.object({
  userId: z.string(),
  userEmail: z.string(),
  isAdmin: z.boolean(),
});

export const TokenOptionSchema = z.object({
  expiresIn: z.string(),
});

export const RefreshTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.date(),
  ipAddress: z.string(),
  userId: z.string(),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const VerifyTokenResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
});

export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
export type TokenOption = z.infer<typeof TokenOptionSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type VerifyTokenResponse = z.infer<typeof VerifyTokenResponseSchema>;
