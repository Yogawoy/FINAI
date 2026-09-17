/**
 * FinAI Mobile Common Entity Types (Directly reflecting backend models & serializers)
 * 
 * STRICT RULES:
 * - Reflects actual database and serializer contracts from src/lib/serializers/
 * - Money values from backend are Decimal strings (e.g. "12500000.00")
 * - Strictly NO `any`
 */

export type WalletType = 'BANK' | 'E_WALLET' | 'CASH';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type BudgetHealthStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export type GoalFrequency = 'WEEKLY' | 'MONTHLY';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  institution: string | null;
  accountLast4: string | null;
  balance: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionWalletSummary {
  id: string;
  name: string;
  type: WalletType;
  institution: string | null;
}

export interface Transaction {
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

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  usedAmount?: string;
  remainingAmount?: string;
  percentage?: number;
  status?: BudgetHealthStatus;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  category: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  frequency: GoalFrequency | string;
  autoDeposit?: boolean;
  nextDueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  remainingAmount?: string;
  progressPercentage?: number;
  remainingMonths?: number;
  recommendedMonthlySaving?: string;
}

export interface FinancialDashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  activeBudgetsCount: number;
  activeGoalsCount: number;
}

export interface CreateTransactionInput {
  walletId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  transactionDate?: string;
}

export interface UpdateTransactionInput {
  walletId?: string;
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
  transactionDate?: string;
}

export interface CreateWalletInput {
  name: string;
  type?: WalletType;
  institution?: string | null;
  accountLast4?: string | null;
  balance?: number;
  color?: string | null;
  icon?: string | null;
}

export interface UpdateWalletInput {
  name?: string;
  type?: WalletType;
  institution?: string | null;
  accountLast4?: string | null;
  color?: string | null;
  icon?: string | null;
}

