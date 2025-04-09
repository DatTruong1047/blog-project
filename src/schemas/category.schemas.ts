import z from 'zod';

const CategoryCore = {
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(16, { message: 'Name must be at most 16 characters long' })
    .regex(/^[a-zA-Z0-9]+$/, { message: 'Name just contain letter' }),
};

export const CategoryQuery = z.object({
  search: z.string().optional().nullish(),
  take: z
    .string()
    .optional()
    .nullish()
    .transform((val) => (val ? parseInt(val) : 10))
    .pipe(z.number().int()),
  skip: z
    .string()
    .optional()
    .nullish()
    .transform((val) => (val ? parseInt(val) : 0))
    .pipe(z.number().int()),
});

export const CategoryParams = z.object({
  id: z.string(),
});

export const CategoryResSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CategoryArrSchema = z.array(CategoryResSchema);

export const UpSertCateSchema = z.object({
  ...CategoryCore,
});

// export const UpdateCateReqSchema = z.object({
//   id: z.string({
//     required_error: 'Id is required',
//     invalid_type_error: 'Id must be a string',
//   }),
//   ...CategoryCore,
// });

export type UpSertCateType = z.infer<typeof UpSertCateSchema>;
// export type UpdateCateReqType = z.infer<typeof UpdateCateReqSchema>;

export type CategoryResponseType = z.infer<typeof CategoryResSchema>;
export type CategoryArrType = z.infer<typeof CategoryArrSchema>;

export type CategoryParamsType = z.infer<typeof CategoryParams>;
export type CategoryQueryType = z.infer<typeof CategoryQuery>;
