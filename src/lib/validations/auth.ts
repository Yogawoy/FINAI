import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  email: z.string().email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(100, 'Password terlalu panjang'),
});

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  rememberMe: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
