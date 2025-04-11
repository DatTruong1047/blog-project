import z from 'zod';

import { CategoryResSchema } from './category.schemas';
import { PaginationSchema, SuccessResponseSchema } from './response.schemas';
import { UserSchema } from './user.schemas';

const statusEnum = z.enum(['PUBLIC', 'PRIVATE', 'DRAFT']);
const sortEnum = z.enum(['createdAt', 'updatedAt', 'title']);
const orderEnum = z.enum(['asc', 'desc']);

const PostBaseSchema = {
  title: z
    .string({
      invalid_type_error: 'Title must be a string',
    })
    .min(5, { message: 'Title must be at least 5 character long' })
    .max(100, { message: 'Title must be at most 50 character long' }),
  status: statusEnum.default('PRIVATE'),
  content: z
    .string({
      invalid_type_error: 'Content must be a string',
    })
    .min(30, { message: 'Title must be at least 30 character long' }),
  // categoryId: z.string().uuid().nullish(),
  categoryId: z
    .string()
    .uuid()
    .nullish()
    .transform((val) => (val === null ? null : val)),
};

export const PostQueryBase = {
  searchTerm: z.string().optional().nullish(),
  sortBy: sortEnum.default('createdAt'),
  sortOrderBy: orderEnum.default('desc'),
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
};

export const PostQuery = z.object({
  categoryId: z.string().uuid().nullish(),
  authorId: z.string().uuid().nullish(),
  ...PostQueryBase,
});

export const MyPostQuery = z.object({
  ...PostQueryBase,
  categoryId: z.string().uuid().nullish(),
  status: statusEnum.default('PUBLIC'),
});

export const PostCateQuery = z.object({
  authorId: z.string().uuid().nullish(),
  ...PostQueryBase,
});

// export const PostSchema = z.object({
//   id: z.string(),
//   ...PostBaseSchema,
//   authorId: z.string().uuid(),
// });

export const CreatePostSchema = z.object({
  ...PostBaseSchema,
  mediaIds: z.array(z.string().uuid()).nullish(),
});

export const UpdatePostSchema = z.object({
  ...PostBaseSchema,
  title: PostBaseSchema.title.nullish(),
  content: PostBaseSchema.content.nullish(),
  status: PostBaseSchema.status.nullish(),
  mediaIds: z.array(z.string().uuid()).nullish(),
});

export const PostSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  status: statusEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  author: UserSchema,
  category: CategoryResSchema.nullable().optional(),
  // PostMedia: z.array(PostMediaSchema),
});

export const PostResponseSchema = SuccessResponseSchema(PostSchema);

export const PostListResponseSchema = z.object({
  posts: z.array(PostSchema),
  pagination: PaginationSchema,
});

export type PostListResponseType = z.infer<typeof PostListResponseSchema>;

// export type PostType = z.infer<typeof PostSchema>;

export type CreatePostType = z.infer<typeof CreatePostSchema>;

export type UpdatePostType = z.infer<typeof UpdatePostSchema>;

export type PostQueryType = z.infer<typeof PostQuery>;
export type MyPostQueryType = z.infer<typeof MyPostQuery>;
export type PostCateQueryType = z.infer<typeof PostCateQuery>;

export type PostType = z.infer<typeof PostSchema>;
export type PostResponseType = z.infer<typeof PostResponseSchema>;
