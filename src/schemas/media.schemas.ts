import z, { string } from 'zod';

const MediaCore = {
  url: z.string(),
  description: z.string().nullish(),
};

export const MediaSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  createdAt: z.date(),
});

export const CreateMediaSchema = z.object({
  ...MediaCore,
});

export const UpdateMediaSchema = z.object({
  id: string(),
  ...MediaCore,
});

export const DeleteMediaSchema = z.object({
  url: string({
    required_error: 'URL is required',
  }),
});

export type CreateMediaType = z.infer<typeof CreateMediaSchema>;
export type UpdateMediaType = z.infer<typeof UpdateMediaSchema>;
export type DeleteMediaType = z.infer<typeof DeleteMediaSchema>;

export type MediaType = z.infer<typeof MediaSchema>;
