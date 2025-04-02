import z from 'zod';

export const errorResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
