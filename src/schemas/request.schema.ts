import { z } from 'zod';

export const ReqParams = z.object({
  id: z.string(),
});

export type ReqParamsType = z.infer<typeof ReqParams>;
