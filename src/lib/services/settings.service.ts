import { prisma } from '@/lib/db';
import { UpdateSettingsInput } from '@/lib/validations/settings';

export class SettingsWalletNotFoundError extends Error {
  constructor(message: string = 'Dompet yang dipilih tidak ditemukan atau bukan milik Anda') {
    super(message);
    this.name = 'SettingsWalletNotFoundError';
  }
}

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
   * Update user settings with ownership checks
   */
  static async updateUserSettings(userId: string, input: UpdateSettingsInput) {
    // Ensure settings record exists
    await this.getUserSettings(userId);

    // If defaultWalletId is provided, verify it belongs to this user (anti-IDOR)
    if (input.defaultWalletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: input.defaultWalletId, userId },
        select: { id: true },
      });

      if (!wallet) {
        throw new SettingsWalletNotFoundError();
      }
    }

    return prisma.userSettings.update({
      where: { userId },
      data: input,
    });
  }
}
