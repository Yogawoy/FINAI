import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { CreateWalletInput, UpdateWalletInput } from '@/lib/validations/wallet';

export class WalletService {
  /**
   * Get all wallets for authenticated user
   */
  static async getWallets(userId: string) {
    return prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get wallet by ID with ownership check
   */
  static async getWalletById(userId: string, walletId: string) {
    return prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId,
      },
    });
  }

  /**
   * Create a new wallet
   */
  static async createWallet(userId: string, input: CreateWalletInput) {
    return prisma.wallet.create({
      data: {
        userId,
        name: input.name,
        type: input.type,
        institution: input.institution || null,
        accountLast4: input.accountLast4 || null,
        balance: new Prisma.Decimal(input.balance ?? 0),
      },
    });
  }

  /**
   * Update wallet with ownership check
   */
  static async updateWallet(userId: string, walletId: string, input: UpdateWalletInput) {
    const existing = await this.getWalletById(userId, walletId);
    if (!existing) return null;

    const data: Prisma.WalletUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.type !== undefined) data.type = input.type;
    if (input.institution !== undefined) data.institution = input.institution;
    if (input.accountLast4 !== undefined) data.accountLast4 = input.accountLast4;
    if (input.balance !== undefined) data.balance = new Prisma.Decimal(input.balance);

    return prisma.wallet.update({
      where: { id: walletId },
      data,
    });
  }

  /**
   * Delete wallet with ownership check
   */
  static async deleteWallet(userId: string, walletId: string) {
    const existing = await this.getWalletById(userId, walletId);
    if (!existing) return null;

    return prisma.wallet.delete({
      where: { id: walletId },
    });
  }
}
