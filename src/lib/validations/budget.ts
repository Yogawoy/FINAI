import { z } from 'zod';

export const CreateBudgetSchema = z.object({
  category: z.string().min(1, 'Kategori anggaran wajib diisi').max(50),
  limitAmount: z.coerce.number().positive('Batas anggaran harus lebih besar dari 0'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export const UpdateBudgetSchema = z.object({
  category: z.string().min(1).max(50).optional(),
  limitAmount: z.coerce.number().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;
