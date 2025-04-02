import z from 'zod';

const sexOptionsEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

const userQuerySchema = z.object({
  searchText: z.string().optional(),
  take: z.number().int().default(5),
  skip: z.number().int().default(0),
});

const userCore = {
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
};

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
  password: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const userProfileSchemaResponse = z.object({
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
  dateOfBirth: z
    .date()
    .optional()
    .refine((date) => !date || date <= new Date(), {
      message: 'Date of birth cannot be in the future',
    }),
  sex: sexOptionsEnum.default('MALE'),
  address: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createUserSchema = z.object({
  ...userCore,
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

export const createUserResponseSchema = z.object({
  data: z.object({ id: z.string().uuid(), ...userCore }),
  message: z.string(),
});

export const updateUserSchema = z.object({
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

  dateOfBirth: z
    .date()
    .optional()
    .refine((date) => !date || date <= new Date(), {
      message: 'Date of birth cannot be in the future',
    }),

  sex: sexOptionsEnum.optional(),
  address: z.string().optional(),
  isVerifiedEmail: z.boolean().optional(),
  mediaId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type userQuery = z.infer<typeof userQuerySchema>;
export type createUserResponse = z.infer<typeof createUserResponseSchema>;
export type updateUser = z.infer<typeof updateUserSchema>;
