import { z } from 'zod';

import { MediaSchema } from './media.schemas';

export const PostMediaSchema = z.object({
  id: z.string(),
  media: MediaSchema,
});
