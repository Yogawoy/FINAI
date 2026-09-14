import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  language: z.string().min(2).max(10).optional(),
  currency: z.string().min(2).max(10).optional(),
  numberFormat: z.string().min(2).max(10).optional(),
  defaultWalletId: z
    .union([z.string().uuid(), z.literal(''), z.null()])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  defaultCategory: z
    .union([z.string().max(50), z.literal(''), z.null()])
    .transform((val) => (val === '' ? null : val))
    .optional()
    .nullable(),
  budgetReminder: z.boolean().optional(),
  goalReminder: z.boolean().optional(),
  financialSummary: z.boolean().optional(),
  aiPersonalization: z.boolean().optional(),
  aiActionConfirmation: z.boolean().optional(),
  animations: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
