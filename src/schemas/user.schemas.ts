import z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

const sexOptionsEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);
const userCore = {
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
};

const createUserSchema = z.object({
  ...userCore,
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(16, { message: 'Password must be at most 16 characters long' })
    .regex(/[a-z]/, { message: 'Password must be contain at least one lowercase letter' })
    .regex(/[A-Z]/, { message: 'Password must be contain at least one uppercase letter' })
    .regex(/[!@#$%^&*(),.?":{}|<>\[\]]/, { message: 'Password must contain at least one speacial character' }),
});

const createUserResponseSchema = z.object({
  id: z.string().uuid(),
  ...userCore,
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email(),
  password: z.string(),
});

const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const userProfileSchemaResponse = z.object({
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

const userQuerySchema = z.object({
  searchText: z.string().optional(),
  take: z.number().int().default(5),
  skip: z.number().int().default(0),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type userQuery = z.infer<typeof userQuerySchema>;

export const createUserSchemaJSON = zodToJsonSchema(createUserSchema, { $refStrategy: 'none' });
export const createUserResponseSchemaJSON = zodToJsonSchema(createUserResponseSchema, { $refStrategy: 'none' });
export const loginSchemaJSON = zodToJsonSchema(loginSchema, { $refStrategy: 'none' });
export const loginResponseSchemaJSON = zodToJsonSchema(loginResponseSchema, { $refStrategy: 'none' });
export const userProfileSchemaResponseJSON = zodToJsonSchema(userProfileSchemaResponse, { $refStrategy: 'none' });
