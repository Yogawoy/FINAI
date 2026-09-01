import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { CreateTransactionInput, UpdateTransactionInput } from '@/lib/validations/transaction';

export interface TransactionFilterOptions {
  walletId?: string;
  type?: 'INCOME' | 'EXPENSE';
  category?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  limit?: number;
  offset?: number;
}

export class TransactionService {
  /**
   * Get transactions with filtering and pagination
   */
  static async getTransactions(userId: string, options: TransactionFilterOptions = {}) {
    const { walletId, type, category, startDate, endDate, limit = 50, offset = 0 } = options;

    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (walletId) where.walletId = walletId;
    if (type) where.type = type;
    if (category) where.category = category;

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: {
          wallet: {
            select: {
              id: true,
              name: true,
              type: true,
              institution: true,
            },
          },
        },
        orderBy: { transactionDate: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      transactions,
    };
  }

  /**
   * Get single transaction by ID with ownership check
   */
  static async getTransactionById(userId: string, transactionId: string) {
    return prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        wallet: true,
      },
    });
  }

  /**
   * Create transaction atomically with wallet balance modification
   */
  static async createTransaction(userId: string, input: CreateTransactionInput) {
    const { walletId, type, amount, category, description, transactionDate } = input;
    const txAmount = new Prisma.Decimal(amount);

    return prisma.$transaction(async (tx) => {
      // 1. Verify wallet ownership
      const wallet = await tx.wallet.findFirst({
        where: { id: walletId, userId },
      });

      if (!wallet) {
        throw new Error('Dompet tidak ditemukan atau bukan milik Anda');
      }

      // 2. If expense, verify sufficient balance
      if (type === 'EXPENSE' && wallet.balance.lessThan(txAmount)) {
        throw new Error('Saldo dompet tidak mencukupi');
      }

      // 3. Update wallet balance atomically
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance:
            type === 'EXPENSE'
              ? { decrement: txAmount }
              : { increment: txAmount },
        },
      });

      // 4. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId,
          type,
          amount: txAmount,
          category,
          description,
          transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        },
        include: {
          wallet: {
            select: {
              id: true,
              name: true,
              type: true,
              institution: true,
            },
          },
        },
      });

      return {
        transaction,
        wallet: updatedWallet,
      };
    });
  }

  /**
   * Update transaction with atomic wallet balance recalculation
   */
  static async updateTransaction(
    userId: string,
    transactionId: string,
    input: UpdateTransactionInput
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id: transactionId, userId },
      });

      if (!existing) return null;

      // Reverse old balance effect on old wallet
      await tx.wallet.update({
        where: { id: existing.walletId },
        data: {
          balance:
            existing.type === 'EXPENSE'
              ? { increment: existing.amount }
              : { decrement: existing.amount },
        },
      });

      // Target wallet ID and values
      const targetWalletId = input.walletId || existing.walletId;
      const targetType = input.type || existing.type;
      const targetAmount = input.amount !== undefined ? new Prisma.Decimal(input.amount) : existing.amount;

      // Verify target wallet
      const targetWallet = await tx.wallet.findFirst({
        where: { id: targetWalletId, userId },
      });

      if (!targetWallet) {
        throw new Error('Dompet target tidak ditemukan');
      }

      if (targetType === 'EXPENSE' && targetWallet.balance.lessThan(targetAmount)) {
        throw new Error('Saldo dompet tidak mencukupi untuk pembaruan transaksi');
      }

      // Apply new balance effect on target wallet
      await tx.wallet.update({
        where: { id: targetWalletId },
        data: {
          balance:
            targetType === 'EXPENSE'
              ? { decrement: targetAmount }
              : { increment: targetAmount },
        },
      });

      // Update transaction record
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          walletId: targetWalletId,
          type: targetType,
          amount: targetAmount,
          category: input.category || existing.category,
          description: input.description || existing.description,
          transactionDate: input.transactionDate ? new Date(input.transactionDate) : existing.transactionDate,
        },
        include: {
          wallet: true,
        },
      });

      return updated;
    });
  }

  /**
   * Delete transaction atomically and restore wallet balance
   */
  static async deleteTransaction(userId: string, transactionId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id: transactionId, userId },
      });

      if (!existing) return null;

      // Restore wallet balance
      await tx.wallet.update({
        where: { id: existing.walletId },
        data: {
          balance:
            existing.type === 'EXPENSE'
              ? { increment: existing.amount }
              : { decrement: existing.amount },
        },
      });

      return tx.transaction.delete({
        where: { id: transactionId },
      });
    });
  }
}
