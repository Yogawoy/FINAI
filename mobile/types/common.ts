/**
 * FinAI Mobile Common Entity Types (Shared with backend domain)
 */

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'bills'
  | 'shopping'
  | 'health'
  | 'education'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other';

export type TransactionType = 'income' | 'expense';

export type WalletType =
  | 'bank'
  | 'ewallet'
  | 'cash'
  | 'savings'
  | 'investment'
  | 'other';

export type WalletColorTheme =
  | 'periwinkle'
  | 'blue'
  | 'mint'
  | 'peach'
  | 'neutral'
  | 'lavender'
  | 'iceblue';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  colorTheme: WalletColorTheme;
  accountIdentifier?: string;
  holderName?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  date: string;
  time?: string;
  walletId?: string;
  walletName?: string;
  note?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  category: TransactionCategory;
  spent: number;
  limit: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  status: 'on_track' | 'needs_attention' | 'behind' | 'completed';
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  savingsRate: number;
}
