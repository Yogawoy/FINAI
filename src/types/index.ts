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
  icon: 'Bank' | 'Wallet' | 'Cash' | 'Card' | 'Savings' | 'Investment' | 'Other' | string;
  colorTheme: WalletColorTheme;
  accountIdentifier?: string; // e.g. "•••• 4821"
  holderName?: string; // e.g. "Yoga W."
  expiry?: string; // e.g. "08/26"
  isArchived?: boolean;
  isDefault?: boolean;
  createdDate?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD or readable
  time: string;
  account: string; // 'Cash' | 'Bank' | 'E-Wallet' or specific account name
  icon?: string;
  note?: string;
  paymentMethod?: 'Cash' | 'Bank' | 'E-Wallet' | string;
  walletId?: string;
  walletName?: string;
}

export type BudgetPeriod = 'monthly' | 'weekly' | 'custom';
export type BudgetHealthStatus = 'on_track' | 'almost_there' | 'over_budget';

export interface BudgetCategory {
  id: string;
  name: string;
  category: TransactionCategory;
  spent: number;
  limit: number;
  color: string;
  icon: string;
  dailyVelocity?: string;
  status: 'safe' | 'warning' | 'exceeded';
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  notes?: string;
  healthStatus?: BudgetHealthStatus;
}

export type GoalStatus = 'on_track' | 'needs_attention' | 'behind' | 'completed';
export type GoalFrequency = 'monthly' | 'weekly';
export type GoalColorTheme = 'periwinkle' | 'lavender' | 'iceblue' | 'mint' | 'peach';
export type GoalCategoryType =
  | 'laptop'
  | 'travel'
  | 'emergency'
  | 'vehicle'
  | 'course'
  | 'home'
  | 'wedding'
  | 'other';

export interface GoalContribution {
  id: string;
  amount: number;
  date: string;
  sourceWalletId: string;
  sourceWalletName: string;
  destinationWalletId: string;
  destinationWalletName: string;
  note?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: GoalCategoryType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date or readable string
  frequency: GoalFrequency;
  monthlySaving: number;
  sourceWalletId: string;
  sourceWalletName: string;
  destinationWalletId: string;
  destinationWalletName: string;
  colorTheme: GoalColorTheme;
  status: GoalStatus;
  notes?: string;
  contributions: GoalContribution[];
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
  icon3d: 'laptop' | 'travel' | 'shield';
  monthlyContribution: number;
  status: string;
}

export interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  category: TransactionCategory;
}

export interface DaySpending {
  day: string;
  amount: number;
  avg: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickInsights?: {
    label: string;
    value: string;
  }[];
}

export type AICoreState = 'idle' | 'thinking' | 'responding';
