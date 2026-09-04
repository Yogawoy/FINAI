import { z } from 'zod';

export const GoalFrequencyEnum = z.enum(['WEEKLY', 'MONTHLY']);

const PositiveAmountSchema = z.coerce
  .number()
  .finite('Nominal target tidak valid')
  .positive('Target nominal harus lebih besar dari 0');

const GoalDateSchema = z
  .union([z.string(), z.date()])
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Deadline target tidak valid');

export const CreateGoalSchema = z.object({
  name: z.string().min(2, 'Nama target minimal 2 karakter').max(100),
  category: z.string().min(1, 'Kategori wajib diisi').max(50),
  targetAmount: PositiveAmountSchema,
  deadline: GoalDateSchema,
  sourceWalletId: z.string().uuid('ID dompet sumber tidak valid').optional().nullable(),
  destinationWalletId: z.string().uuid('ID dompet tujuan tidak valid').optional().nullable(),
  frequency: GoalFrequencyEnum.default('MONTHLY'),
  autoDeposit: z.boolean().optional(),
}).strict();

export const UpdateGoalSchema = z.object({
  name: z.string().min(2, 'Nama target minimal 2 karakter').max(100).optional(),
  category: z.string().min(1, 'Kategori wajib diisi').max(50).optional(),
  targetAmount: PositiveAmountSchema.optional(),
  deadline: GoalDateSchema.optional(),
  sourceWalletId: z.string().uuid('ID dompet sumber tidak valid').optional().nullable(),
  destinationWalletId: z.string().uuid('ID dompet tujuan tidak valid').optional().nullable(),
  frequency: GoalFrequencyEnum.optional(),
  autoDeposit: z.boolean().optional(),
}).strict();

export const CreateGoalContributionSchema = z.object({
  sourceWalletId: z.string().uuid('ID dompet sumber tidak valid'),
  amount: z.coerce
    .number()
    .finite('Nominal setoran tidak valid')
    .positive('Nominal setoran harus lebih besar dari 0'),
  contributionDate: GoalDateSchema.optional(),
}).strict();

export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type CreateGoalContributionInput = z.infer<typeof CreateGoalContributionSchema>;
