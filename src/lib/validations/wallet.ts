import { z } from 'zod';

export const WalletTypeEnum = z.enum(['BANK', 'E_WALLET', 'CASH']);

export const CreateWalletSchema = z.object({
  name: z.string().min(2, 'Nama dompet minimal 2 karakter').max(50),
  type: WalletTypeEnum.default('BANK'),
  institution: z.string().max(50).optional().nullable(),
  accountLast4: z.string().max(10).optional().nullable(),
  balance: z.coerce
    .number()
    .min(0, 'Saldo awal tidak boleh negatif')
    .default(0),
});

export const UpdateWalletSchema = z.object({
  name: z.string().min(2, 'Nama dompet minimal 2 karakter').max(50).optional(),
  type: WalletTypeEnum.optional(),
  institution: z.string().max(50).optional().nullable(),
  accountLast4: z.string().max(10).optional().nullable(),
  balance: z.coerce.number().min(0, 'Saldo tidak boleh negatif').optional(),
});

export const TransferWalletSchema = z.object({
  fromWalletId: z.string().uuid('ID dompet asal tidak valid'),
  toWalletId: z.string().uuid('ID dompet tujuan tidak valid'),
  amount: z.coerce.number().positive('Nominal transfer harus lebih besar dari 0'),
  date: z.string().optional(),
  note: z.string().max(200).optional(),
});

export type CreateWalletInput = z.infer<typeof CreateWalletSchema>;
export type UpdateWalletInput = z.infer<typeof UpdateWalletSchema>;
export type TransferWalletInput = z.infer<typeof TransferWalletSchema>;
