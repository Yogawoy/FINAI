import { z } from 'zod';

export const GoalFrequencyEnum = z.enum(['WEEKLY', 'MONTHLY']);

export const CreateGoalSchema = z.object({
  name: z.string().min(2, 'Nama target minimal 2 karakter').max(100),
  category: z.string().min(1, 'Kategori wajib diisi').max(50),
  targetAmount: z.coerce.number().positive('Target nominal harus lebih besar dari 0'),
  currentAmount: z.coerce.number().min(0).default(0),
  deadline: z.string().or(z.date()),
  sourceWalletId: z.string().uuid().optional().nullable(),
  destinationWalletId: z.string().uuid().optional().nullable(),
  frequency: GoalFrequencyEnum.default('MONTHLY'),
});

export const UpdateGoalSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  targetAmount: z.coerce.number().positive().optional(),
  currentAmount: z.coerce.number().min(0).optional(),
  deadline: z.string().or(z.date()).optional(),
  sourceWalletId: z.string().uuid().optional().nullable(),
  destinationWalletId: z.string().uuid().optional().nullable(),
  frequency: GoalFrequencyEnum.optional(),
});

export const CreateGoalContributionSchema = z.object({
  sourceWalletId: z.string().uuid('ID dompet sumber tidak valid'),
  amount: z.coerce.number().positive('Nominal setoran harus lebih besar dari 0'),
  contributionDate: z.string().or(z.date()).optional(),
});

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type CreateGoalContributionInput = z.infer<typeof CreateGoalContributionSchema>;
