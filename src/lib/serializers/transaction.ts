import { Prisma, Transaction, TransactionType, WalletType } from '@prisma/client';

interface TransactionWalletSummary {
  id: string;
  name: string;
  type: WalletType;
  institution: string | null;
}

export interface SerializedTransaction {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  wallet?: TransactionWalletSummary;
}

function formatDecimal(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

export function serializeTransaction(transaction: {
  id: string;
  userId: string;
  walletId: string;
  type: Transaction['type'];
  amount: Prisma.Decimal;
  category: string;
  description: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  wallet?: TransactionWalletSummary;
}): SerializedTransaction {
  return {
    id: transaction.id,
    userId: transaction.userId,
    walletId: transaction.walletId,
    type: transaction.type,
    amount: formatDecimal(transaction.amount),
    category: transaction.category,
    description: transaction.description,
    transactionDate: transaction.transactionDate.toISOString(),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
    ...(transaction.wallet ? { wallet: transaction.wallet } : {}),
  };
}

export function serializeTransactions(
  transactions: Array<Parameters<typeof serializeTransaction>[0]>
): SerializedTransaction[] {
  return transactions.map(serializeTransaction);
}
