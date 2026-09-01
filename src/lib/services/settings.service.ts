import { prisma } from '@/lib/db';
import { UpdateSettingsInput } from '@/lib/validations/settings';

export class SettingsService {
  /**
   * Get user settings or auto-create default settings if none exists
   */
  static async getUserSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          language: 'id-ID',
          currency: 'IDR',
          numberFormat: 'id-ID',
          budgetReminder: true,
          goalReminder: true,
          financialSummary: true,
          aiPersonalization: true,
          aiActionConfirmation: true,
          animations: true,
        },
      });
    }

    return settings;
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(userId: string, input: UpdateSettingsInput) {
    // Ensure settings record exists
    await this.getUserSettings(userId);

    return prisma.userSettings.update({
      where: { userId },
      data: input,
    });
  }
}
