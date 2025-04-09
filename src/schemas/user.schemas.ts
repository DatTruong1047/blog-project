import z from 'zod';

const GenderOptionsEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

const PasswordType = z
  .string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  })
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(16, { message: 'Password must be at most 16 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>\[\]]).*$/, {
    message: 'Password must contain at least one lowercase letter, one uppercase letter, and one special character',
  });

const UserCore = {
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
};

const UserQuerySchema = z.object({
  searchText: z.string().optional(),
  take: z.number().int().default(5),
  skip: z.number().int().default(0),
});

export const ForgotPasswordRequestSchema = z.object({
  ...UserCore,
});

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
  password: PasswordType,
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RefreshTokenResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const UserProfileResponseSchema = z.object({
  email: z.string().email().optional().nullish(),
  firstname: z.string().optional().nullish(),
  lastname: z.string().optional().nullish(),
  birthDay: z.date().optional().nullish(),
  gender: GenderOptionsEnum.default('MALE').optional(),
  address: z.string().optional().nullish(),
  createdAt: z.date().optional().nullish(),
  updatedAt: z.date().optional().nullish(),
  avatarPath: z.string(),
});

export const CreateUserSchema = z.object({
  ...UserCore,
  password: PasswordType,
});

export const CreateUserResponseSchema = z.object({
  id: z.string().uuid(),
  ...UserCore,
});

export const UpdateProfileSchema = z.object({
  firstname: z
    .string({
      required_error: 'First name is required',
      invalid_type_error: 'First name must be a string',
    })
    .min(3, { message: 'First name must be at least 3 characters' })
    .max(50, { message: 'First name must be at most 50 characters' })
    .optional()
    .nullish(),

  lastname: z
    .string({
      required_error: 'Last name is required',
      invalid_type_error: 'Last name must be a string',
    })
    .min(3, { message: 'Last name at least three characters long' })
    .max(50, { message: 'First name must be at most 50 characters' })
    .optional()
    .nullish(),
  birthDay: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Invalid date format (YYYY-MM-DD)' })
    .optional()
    // .refine((date) => !date || date <= new Date(), {
    //   message: 'Date of birth cannot be in the future',
    // })
    .nullish(),

  gender: GenderOptionsEnum.optional().nullish(),
  address: z.string().optional().nullish(),
});

export const ChangePasswordRequestSchema = z
  .object({
    oldPassword: PasswordType,
    password: PasswordType,
    confirmPassword: PasswordType,
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginResType = z.infer<typeof LoginResponseSchema>;

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;

export type UserQuery = z.infer<typeof UserQuerySchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;

export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>;

export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
