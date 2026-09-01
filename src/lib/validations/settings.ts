import { z } from 'zod';

export const UpdateSettingsSchema = z.object({
  language: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  numberFormat: z.string().max(10).optional(),
  defaultWalletId: z.string().uuid().optional().nullable(),
  defaultCategory: z.string().max(50).optional().nullable(),
  budgetReminder: z.boolean().optional(),
  goalReminder: z.boolean().optional(),
  financialSummary: z.boolean().optional(),
  aiPersonalization: z.boolean().optional(),
  aiActionConfirmation: z.boolean().optional(),
  animations: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
