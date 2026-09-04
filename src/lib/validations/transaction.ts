import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);

const PositiveAmountSchema = z.coerce
  .number()
  .finite('Nominal transaksi tidak valid')
  .positive('Nominal transaksi harus lebih besar dari 0');

const TransactionDateSchema = z
  .union([z.string(), z.date()])
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Tanggal transaksi tidak valid');

export const CreateTransactionSchema = z.object({
  walletId: z.string().uuid('ID dompet tidak valid'),
  type: TransactionTypeEnum,
  amount: PositiveAmountSchema,
  category: z.string().min(1, 'Kategori wajib diisi').max(50),
  description: z.string().min(1, 'Deskripsi transaksi wajib diisi').max(255),
  transactionDate: TransactionDateSchema.optional(),
}).strict();

export const UpdateTransactionSchema = z.object({
  walletId: z.string().uuid('ID dompet tidak valid').optional(),
  type: TransactionTypeEnum.optional(),
  amount: PositiveAmountSchema.optional(),
  category: z.string().min(1, 'Kategori wajib diisi').max(50).optional(),
  description: z.string().min(1, 'Deskripsi transaksi wajib diisi').max(255).optional(),
  transactionDate: TransactionDateSchema.optional(),
}).strict();

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
