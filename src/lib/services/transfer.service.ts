import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { TransferWalletInput } from '@/lib/validations/wallet';

export class TransferNotFoundError extends Error {
  constructor(message: string = 'Dompet tidak ditemukan atau bukan milik Anda') {
    super(message);
    this.name = 'TransferNotFoundError';
  }
}

export class TransferValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransferValidationError';
  }
}

export class TransferInsufficientBalanceError extends Error {
  constructor(message: string = 'Saldo dompet asal tidak mencukupi untuk transfer') {
    super(message);
    this.name = 'TransferInsufficientBalanceError';
  }
}

export class TransferService {
  /**
   * Atomic transfer between two wallets owned by the same user.
   * Internal transfer does NOT create EXPENSE or INCOME transactions.
   */
  static async transferBetweenWallets(userId: string, input: TransferWalletInput) {
    const { fromWalletId, toWalletId, amount } = input;
    const transferAmount = new Prisma.Decimal(amount);

    if (transferAmount.lte(0)) {
      throw new TransferValidationError('Nominal transfer harus lebih besar dari 0');
    }

    if (fromWalletId === toWalletId) {
      throw new TransferValidationError('Dompet asal dan tujuan tidak boleh sama');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Check source wallet ownership & balance
      const fromWallet = await tx.wallet.findFirst({
        where: { id: fromWalletId, userId },
      });

      if (!fromWallet) {
        throw new TransferNotFoundError('Dompet asal tidak ditemukan atau bukan milik Anda');
      }

      // 2. Check destination wallet ownership
      const toWallet = await tx.wallet.findFirst({
        where: { id: toWalletId, userId },
      });

      if (!toWallet) {
        throw new TransferNotFoundError('Dompet tujuan tidak ditemukan atau bukan milik Anda');
      }

      // 3. Conditional update on source wallet to prevent race conditions
      const updatedFromCount = await tx.wallet.updateMany({
        where: {
          id: fromWalletId,
          userId,
          balance: { gte: transferAmount },
        },
        data: {
          balance: { decrement: transferAmount },
        },
      });

      if (updatedFromCount.count === 0) {
        throw new TransferInsufficientBalanceError();
      }

      // 4. Increment destination wallet balance
      const updatedToWallet = await tx.wallet.update({
        where: { id: toWalletId },
        data: {
          balance: { increment: transferAmount },
        },
      });

      // Fetch fresh source wallet state
      const updatedFromWallet = await tx.wallet.findUniqueOrThrow({
        where: { id: fromWalletId },
      });

      return {
        fromWallet: updatedFromWallet,
        toWallet: updatedToWallet,
      };
    });
  }
}
