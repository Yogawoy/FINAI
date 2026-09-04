import { z } from 'zod';

const PositiveAmountSchema = z.coerce
  .number()
  .finite('Batas anggaran tidak valid')
  .positive('Batas anggaran harus lebih besar dari 0');

export const CreateBudgetSchema = z.object({
  category: z.string().min(1, 'Kategori anggaran wajib diisi').max(50),
  limitAmount: PositiveAmountSchema,
  month: z.coerce.number().int().min(1, 'Bulan minimal 1').max(12, 'Bulan maksimal 12'),
  year: z.coerce.number().int().min(2020, 'Tahun minimal 2020').max(2100, 'Tahun maksimal 2100'),
}).strict();

export const UpdateBudgetSchema = z.object({
  category: z.string().min(1, 'Kategori anggaran wajib diisi').max(50).optional(),
  limitAmount: PositiveAmountSchema.optional(),
  month: z.coerce.number().int().min(1, 'Bulan minimal 1').max(12, 'Bulan maksimal 12').optional(),
  year: z.coerce.number().int().min(2020, 'Tahun minimal 2020').max(2100, 'Tahun maksimal 2100').optional(),
}).strict();

export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>;
