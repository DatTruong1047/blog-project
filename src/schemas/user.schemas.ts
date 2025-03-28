import z from 'zod';

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  roleId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
