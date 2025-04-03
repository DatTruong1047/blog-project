import z from 'zod';

export const ResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
});

export type Response = z.infer<typeof ResponseSchema>;
