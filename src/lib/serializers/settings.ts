import { UserSettings } from '@prisma/client';
import { SerializedSettings } from '@/types';

export function serializeSettings(settings: UserSettings): SerializedSettings {
  return {
    id: settings.id,
    userId: settings.userId,
    language: settings.language,
    currency: settings.currency,
    numberFormat: settings.numberFormat,
    defaultWalletId: settings.defaultWalletId,
    defaultCategory: settings.defaultCategory,
    budgetReminder: settings.budgetReminder,
    goalReminder: settings.goalReminder,
    financialSummary: settings.financialSummary,
    aiPersonalization: settings.aiPersonalization,
    aiActionConfirmation: settings.aiActionConfirmation,
    animations: settings.animations,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}
