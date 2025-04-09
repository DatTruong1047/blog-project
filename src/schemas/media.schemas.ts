import z, { string } from 'zod';

const MediaCore = {
  url: z.string(),
  description: z.string().optional().nullish(),
};

export const CreateMediaSchema = z.object({
  ...MediaCore,
});

export const UpdateMediaSchema = z.object({
  id: string(),
  ...MediaCore,
});

export type CreateMediaType = z.infer<typeof CreateMediaSchema>;
export type UpdateMediaType = z.infer<typeof UpdateMediaSchema>;
