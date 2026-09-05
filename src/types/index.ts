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
  status?: string;
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
  iconName?: string;
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
export type GoalColorTheme = 'periwinkle' | 'lavender' | 'iceblue' | 'mint' | 'peach' | 'indigo';
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
  weeklySaving?: number;
  autoDeposit?: boolean;
  nextDueDate?: string;
  sourceWalletId: string;
  sourceWalletName: string;
  destinationWalletId: string;
  destinationWalletName: string;
  colorTheme: GoalColorTheme;
  status: GoalStatus;
  notes?: string;
  contributions: GoalContribution[];
  createdAt?: string;
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

export type AIActionType = 'expense' | 'income' | 'goal_contribution' | 'transfer' | 'budget_check' | 'analytics_insight';

export interface AIFinancialAction {
  id: string;
  type: AIActionType;
  title: string;
  amount: number;
  category?: string;
  sourceWallet?: string;
  destinationWallet?: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'success' | 'error';
  note?: string;
  // Real goal snapshot untuk progress card (bukan tebakan — diisi dari context).
  goalCurrentAmount?: number;
  goalTargetAmount?: number;
  errorMessage?: string;
}

export interface AIInsightData {
  type: 'budget' | 'goal' | 'analytics';
  title: string;
  subtitle?: string;
  metrics: {
    label: string;
    value: string;
    highlight?: boolean;
    color?: string;
  }[];
  actionLabel?: string;
  actionHref?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: AIFinancialAction;
  insight?: AIInsightData;
  error?: boolean;
  quickInsights?: {
    label: string;
    value: string;
  }[];
  // Structured financial cards — read-only, no confirmation
  budgetCard?: {
    category: string;
    limitAmount: number;
    usedAmount: number;
    remainingAmount: number;
    percentage: number;
    status?: string;
    period?: string;
  };
  goalCard?: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    percentage: number;
    deadline?: string | null;
    category?: string;
  };
  walletCard?: {
    wallets: { name: string; balance: number; type?: string }[];
    totalBalance: number;
  };
  summaryCard?: {
    period?: string;
    income: number;
    expense: number;
    remaining: number;
    budgetPercentage?: number;
    activeGoals?: number;
  };
  spendingBreakdownCard?: {
    items: { category: string; total: number; percentage?: number }[];
    period?: string;
  };
  clarification?: {
    message: string;
    relatedGoalId?: string;
    newGoalHref?: string;
    newGoalLabel?: string;
    existingGoalName?: string;
  };
  financialPlanCard?: {
    targetName: string;
    targetAmount: number;
    currentAmount: number;
    remainingAmount: number;
    durationMonths: number;
    requiredMonthlySaving: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyNetCashFlow: number;
    requiredPercentageOfNet: number;
    feasibility: 'realistic' | 'tight' | 'unlikely' | 'insufficient_data';
    assumptions?: string[];
    relatedGoalId?: string | null;
    wallets?: { id: string; name: string }[];
  };
}

export type AICoreState = 'idle' | 'thinking' | 'responding';

