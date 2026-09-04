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

export class TransactionNotFoundError extends Error {
  constructor(message: string = 'Transaksi tidak ditemukan atau bukan milik Anda') {
    super(message);
    this.name = 'TransactionNotFoundError';
  }
}

export class WalletNotFoundError extends Error {
  constructor(message: string = 'Dompet tidak ditemukan atau bukan milik Anda') {
    super(message);
    this.name = 'WalletNotFoundError';
  }
}

export class InsufficientBalanceError extends Error {
  constructor(message: string = 'Saldo wallet tidak mencukupi.') {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
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

    if (walletId) {
      const wallet = await prisma.wallet.findFirst({
        where: { id: walletId, userId },
        select: { id: true },
      });

      if (!wallet) {
        throw new WalletNotFoundError();
      }

      where.walletId = walletId;
    }

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
        orderBy: [
          { transactionDate: 'desc' },
          { createdAt: 'desc' },
        ],
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
  }

  /**
   * Create transaction atomically with wallet balance modification
   */
  static async createTransaction(userId: string, input: CreateTransactionInput) {
    const { walletId, type, amount, category, description, transactionDate } = input;
    const txAmount = new Prisma.Decimal(amount);

    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findFirst({
        where: { id: walletId, userId },
      });

      if (!wallet) {
        throw new WalletNotFoundError();
      }

      if (type === 'EXPENSE' && wallet.balance.lessThan(txAmount)) {
        throw new InsufficientBalanceError();
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance:
            type === 'EXPENSE'
              ? { decrement: txAmount }
              : { increment: txAmount },
        },
      });

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

      if (!existing) {
        throw new TransactionNotFoundError();
      }

      await tx.wallet.update({
        where: { id: existing.walletId },
        data: {
          balance:
            existing.type === 'EXPENSE'
              ? { increment: existing.amount }
              : { decrement: existing.amount },
        },
      });

      const targetWalletId = input.walletId || existing.walletId;
      const targetType = input.type || existing.type;
      const targetAmount = input.amount !== undefined ? new Prisma.Decimal(input.amount) : existing.amount;

      const targetWallet = await tx.wallet.findFirst({
        where: { id: targetWalletId, userId },
      });

      if (!targetWallet) {
        throw new WalletNotFoundError();
      }

      if (targetType === 'EXPENSE' && targetWallet.balance.lessThan(targetAmount)) {
        throw new InsufficientBalanceError();
      }

      await tx.wallet.update({
        where: { id: targetWalletId },
        data: {
          balance:
            targetType === 'EXPENSE'
              ? { decrement: targetAmount }
              : { increment: targetAmount },
        },
      });

      return tx.transaction.update({
        where: { id: transactionId },
        data: {
          walletId: targetWalletId,
          type: targetType,
          amount: targetAmount,
          category: input.category ?? existing.category,
          description: input.description ?? existing.description,
          transactionDate: input.transactionDate ? new Date(input.transactionDate) : existing.transactionDate,
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

      if (!existing) {
        throw new TransactionNotFoundError();
      }

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
    });
  }
}
