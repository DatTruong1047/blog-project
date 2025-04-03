import z from 'zod';

const GenderOptionsEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

const UserQuerySchema = z.object({
  searchText: z.string().optional(),
  take: z.number().int().default(5),
  skip: z.number().int().default(0),
});

const UserCore = {
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
};

export const ChangePasswordRequestSchema = z.object({
  ...UserCore,
});

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const UserProfileSchemaResponse = z.object({
  id: z.string().uuid().optional(),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
  firstname: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(3, 'First name must be at least 3 characters')
    .max(50, { message: 'First name must be at most 50 characters' }),
  lastname: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    })
    .min(3, 'Last name at least three characters long')
    .max(50, { message: 'First name must be at most 50 characters' }),
  birthDay: z
    .date()
    .optional()
    .refine((date) => !date || date <= new Date(), {
      message: 'Date of birth cannot be in the future',
    }),
  gender: GenderOptionsEnum.default('MALE'),
  address: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateUserSchema = z.object({
  ...UserCore,
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(16, { message: 'Password must be at most 16 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>\[\]]).*$/, {
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one special character',
    }),
});

export const CreateUserResponseSchema = z.object({
  id: z.string().uuid(),
  ...UserCore,
});

export const UpdateUserSchema = z.object({
  firstname: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(3, { message: 'First name must be at least 3 characters' })
    .max(50, { message: 'First name must be at most 50 characters' })
    .optional(),

  lastname: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    })
    .min(3, { message: 'Last name at least three characters long' })
    .max(50, { message: 'First name must be at most 50 characters' })
    .optional(),

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(16, { message: 'Password must be at most 16 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>\[\]]).*$/, {
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one special character',
    })
    .optional(),

  birthDay: z
    .date()
    .optional()
    .refine((date) => !date || date <= new Date(), {
      message: 'Date of birth cannot be in the future',
    }),

  gender: GenderOptionsEnum.optional(),
  address: z.string().optional(),
  isVerifiedEmail: z.boolean().optional(),
  mediaId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UserQuery = z.infer<typeof UserQuerySchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
