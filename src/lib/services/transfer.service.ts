import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { TransferWalletInput } from '@/lib/validations/wallet';

export class TransferService {
  /**
   * Atomic transfer between two wallets owned by the same user
   */
  static async transferBetweenWallets(userId: string, input: TransferWalletInput) {
    const { fromWalletId, toWalletId, amount, date, note } = input;
    const transferAmount = new Prisma.Decimal(amount);

    if (fromWalletId === toWalletId) {
      throw new Error('Dompet asal dan tujuan tidak boleh sama');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Check source wallet ownership & balance
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, userId },
      });

      if (!fromWallet) {
        throw new Error('Dompet asal tidak ditemukan atau bukan milik Anda');
      }

      if (fromWallet.balance.lessThan(transferAmount)) {
        throw new Error('Saldo dompet asal tidak mencukupi untuk transfer');
      }

      // 2. Check destination wallet ownership
      const toWallet = await tx.wallet.findFirst({
        where: { id: toWalletId, userId },
      });

      if (!toWallet) {
        throw new Error('Dompet tujuan tidak ditemukan atau bukan milik Anda');
      }

      // 3. Debit source wallet
      const updatedFromWallet = await tx.wallet.update({
        where: { id: fromWalletId },
        data: {
          balance: {
            decrement: transferAmount,
          },
        },
      });

      // 4. Credit destination wallet
      const updatedToWallet = await tx.wallet.update({
        where: { id: toWalletId },
        data: {
          balance: {
            increment: transferAmount,
          },
        },
      });

      const txDate = date ? new Date(date) : new Date();
      const description = note || `Transfer ke ${toWallet.name}`;

      // 5. Create expense record on source
      const outTransaction = await tx.transaction.create({
        data: {
          userId,
          walletId: fromWalletId,
          type: 'EXPENSE',
          amount: transferAmount,
          category: 'Transfer Keluar',
          description,
          transactionDate: txDate,
        },
      });

      // 6. Create income record on destination
      const inTransaction = await tx.transaction.create({
        data: {
          userId,
          walletId: toWalletId,
          type: 'INCOME',
          amount: transferAmount,
          category: 'Transfer Masuk',
          description: `Transfer dari ${fromWallet.name}`,
          transactionDate: txDate,
        },
      });

      return {
        fromWallet: updatedFromWallet,
        toWallet: updatedToWallet,
        outTransaction,
        inTransaction,
      };
    });
  }
}
