import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const CreateTransactionSchema = z.object({
  walletId: z.string().uuid('ID dompet tidak valid'),
  type: TransactionTypeEnum,
  amount: z.coerce.number().positive('Nominal transaksi harus lebih besar dari 0'),
  category: z.string().min(1, 'Kategori wajib diisi').max(50),
  description: z.string().min(1, 'Deskripsi transaksi wajib diisi').max(255),
  transactionDate: z.string().or(z.date()).optional(),
});

export const UpdateTransactionSchema = z.object({
  walletId: z.string().uuid('ID dompet tidak valid').optional(),
  type: TransactionTypeEnum.optional(),
  amount: z.coerce.number().positive('Nominal transaksi harus lebih besar dari 0').optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(255).optional(),
  transactionDate: z.string().or(z.date()).optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
