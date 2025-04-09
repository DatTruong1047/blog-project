import z from 'zod';

const ResponseCore = {
  code: z.number(),
};

const UploadFileCore = {
  success: z.boolean(),
  filePath: z.string().optional().nullish(),
};

export const ErrorResponseSchema = z.object({
  message: z.string().nullish().optional(),
  ...ResponseCore,
});

export const SuccessResWithoutDataSchema = z.object({
  ...ResponseCore,
  status: z.string().optional().nullish(),
});

export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T | null) => {
  return z.object({
    ...ResponseCore,
    status: z.string().optional().nullish(),
    data: dataSchema,
  });
};

export const ResponseSchema = z.object({
  ...ResponseCore,
  status: z.string().optional().nullish(),
});

export const UpLoadFileResponseSchema = z.object({
  ...UploadFileCore,
});

export const UpLoadFileSchema = z.object({
  ...UploadFileCore,
  code: z.number(),
  message: z.string(),
});

// Type
export type UpLoadFileType = z.infer<typeof UpLoadFileSchema>;

// Response Type
export type ErrorResponseType = z.infer<typeof ErrorResponseSchema>;

export type UpLoadFileResType = z.infer<typeof UpLoadFileResponseSchema>;

export type SuccessResponseType<T> = z.infer<ReturnType<typeof SuccessResponseSchema<z.ZodType<T>>>>;
export type SuccessResWithoutDataType = z.infer<typeof SuccessResWithoutDataSchema>;
