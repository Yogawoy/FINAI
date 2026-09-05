import { z } from 'zod';

// ---------------------------------------------------------------------------
// Request validation — client → /api/ai/chat
// ---------------------------------------------------------------------------

export const AIChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(5000),
});

export const AIChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Pesan tidak boleh kosong')
    .max(2000, 'Pesan terlalu panjang (maksimal 2000 karakter)')
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, 'Pesan tidak boleh kosong'),
  history: z
    .array(AIChatHistoryItemSchema)
    .max(20, 'Riwayat percakapan terlalu panjang')
    .optional()
    .default([]),
});

export type AIChatRequestInput = z.infer<typeof AIChatRequestSchema>;

// ---------------------------------------------------------------------------
// Structured response types — server → client
// ---------------------------------------------------------------------------

export const FinancialActionTypeSchema = z.enum([
  'create_transaction',
  'transfer',
  'goal_contribution',
  'create_budget',
  'create_goal',
]);

export const GrokFinancialActionPayloadSchema = z.object({
  transactionType: z.enum(['INCOME', 'EXPENSE']).optional(),
  amount: z.string().regex(/^\d+$/, 'Amount harus berupa string angka'),
  description: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(50).optional(),
  walletId: z.string().nullable().optional(),
  walletName: z.string().nullable().optional(),
  sourceWalletId: z.string().nullable().optional(),
  sourceWalletName: z.string().nullable().optional(),
  destinationWalletId: z.string().nullable().optional(),
  destinationWalletName: z.string().nullable().optional(),
  goalName: z.string().nullable().optional(),
  goalId: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
});

export const GrokStructuredResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    message: z.string().min(1).max(5000),
  }),
  z.object({
    type: z.literal('financial_action'),
    action: FinancialActionTypeSchema,
    payload: GrokFinancialActionPayloadSchema,
    message: z.string().min(1).max(2000),
    requiresConfirmation: z.literal(true),
  }),
  z.object({
    type: z.literal('clarification'),
    message: z.string().min(1).max(2000),
    data: z
      .object({
        relatedGoalId: z.string().optional(),
        newGoalHref: z.string().optional(),
        newGoalLabel: z.string().optional(),
        existingGoalName: z.string().optional(),
      })
      .optional()
      .default({}),
  }),
  z.object({
    type: z.literal('error'),
    message: z.string().min(1).max(2000),
  }),
  // Read-only financial cards — no mutation, no confirmation
  z.object({
    type: z.literal('budget'),
    message: z.string().min(1).max(2000),
    data: z.object({
      category: z.string().min(1),
      limitAmount: z.string().regex(/^\d+$/),
      usedAmount: z.string().regex(/^\d+$/),
      remainingAmount: z.string().regex(/^\d+$/),
      percentage: z.number().min(0).max(1000),
      status: z.string().optional(),
      period: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('goal'),
    message: z.string().min(1).max(2000),
    data: z.object({
      goalId: z.string().optional(),
      name: z.string().min(1),
      targetAmount: z.string().regex(/^\d+$/),
      currentAmount: z.string().regex(/^\d+$/),
      remainingAmount: z.string().regex(/^\d+$/),
      percentage: z.number().min(0).max(100),
      deadline: z.string().nullable().optional(),
      category: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('wallet'),
    message: z.string().min(1).max(2000),
    data: z.object({
      wallets: z.array(z.object({ name: z.string(), balance: z.string(), type: z.string().optional() })),
      totalBalance: z.string().regex(/^\d+$/),
    }),
  }),
  z.object({
    type: z.literal('summary'),
    message: z.string().min(1).max(2000),
    data: z.object({
      period: z.string().optional(),
      income: z.string().regex(/^\d+$/),
      expense: z.string().regex(/^\d+$/),
      remaining: z.string().regex(/^\d+$/),
      budgetPercentage: z.number().optional(),
      activeGoals: z.number().optional(),
    }),
  }),
  z.object({
    type: z.literal('insight'),
    message: z.string().min(1).max(5000),
    data: z
      .object({
        title: z.string().optional(),
        value: z.string().optional(),
        change: z.string().optional(),
        detail: z.string().optional(),
      })
      .optional(),
  }),
  z.object({
    type: z.literal('spending_breakdown'),
    message: z.string().min(1).max(5000),
    data: z.object({
      items: z.array(
        z.object({
          category: z.string().min(1),
          total: z.string().regex(/^\d+$/),
          percentage: z.number().min(0).max(100).optional(),
        })
      ),
      period: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal('financial_plan'),
    message: z.string().min(1).max(5000),
    data: z.object({
      targetName: z.string().min(1),
      targetAmount: z.string().regex(/^\d+$/),
      currentAmount: z.string().regex(/^\d+$/).default('0'),
      remainingAmount: z.string().regex(/^\d+$/).default('0'),
      durationMonths: z.number().int().positive().optional(),
      requiredMonthlySaving: z.string().regex(/^\d+$/).default('0'),
      monthlyIncome: z.string().regex(/^\d+$/).default('0'),
      monthlyExpense: z.string().regex(/^\d+$/).default('0'),
      monthlyNetCashFlow: z.string().regex(/^\d+$/).default('0'),
      requiredPercentageOfNet: z.number().min(0).max(100).default(0),
      feasibility: z.enum(['realistic', 'tight', 'unlikely', 'insufficient_data']).default('insufficient_data'),
      assumptions: z.array(z.string()).default([]),
      relatedGoalId: z.string().nullable().optional(),
    }),
    payload: z
      .object({
        goal: z.string().optional(),
        duration_months: z.string().regex(/^\d+$/).optional(),
        monthly_savings_needed: z.string().regex(/^\d+$/).optional(),
        available_monthly_surplus: z.string().regex(/^\d+$/).optional(),
        feasibility: z.string().optional(),
        suggestion: z.string().optional(),
      })
      .optional()
      .default({}),
  }),
]);

export type GrokStructuredResponse = z.infer<typeof GrokStructuredResponseSchema>;
export type FinancialActionType = z.infer<typeof FinancialActionTypeSchema>;

// ---------------------------------------------------------------------------
// Internal Grok API types
// ---------------------------------------------------------------------------

export interface GrokChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokCompletionResponse {
  id: string;
  choices: {
    message: { role: string; content: string };
    finish_reason: string;
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ---------------------------------------------------------------------------
// User context passed to Grok (minimal, safe)
// ---------------------------------------------------------------------------

export interface GrokUserContext {
  wallets: { id: string; name: string; type: string; balance?: string }[];
  goals: { id: string; name: string; category: string; targetAmount?: string; currentAmount?: string; remainingAmount?: string; percentage?: number; deadline?: string | null }[];
  budgets: { category: string; limitAmount?: string; usedAmount?: string; remainingAmount?: string; percentage?: number; status?: string }[];
  recentTransactions: { description: string; category: string; type: string; amount: string }[];
  currentDate: string;
  financialSummary?: {
    period: string;
    income: string;
    expense: string;
    remaining: string;
    budgetPercentage?: number;
    activeGoals: number;
  };
  categoryTotals?: { items: { category: string; total: string; percentage?: number }[]; period: string };
  trend?: {
    currentPeriodExpense: string;
    previousPeriodExpense?: string;
    changePercentage?: number;
  };
  monthlyIncome?: string;
  monthlyExpense?: string;
  monthlyNetCashFlow?: string;
}

// ---------------------------------------------------------------------------
// Response normalization — tolerate common LLM shape deviations
// ---------------------------------------------------------------------------

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function normalizeFinancialPlanData(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  const src = raw.data || raw.payload || raw;
  if (!src || typeof src !== 'object') return raw;

  const targetName = typeof src.targetName === 'string' ? src.targetName : typeof src.goal === 'string' ? src.goal : '';
  const targetAmountRaw = src.targetAmount ?? src.target ?? src.amount ?? '0';
  const currentAmountRaw = src.currentAmount ?? src.current ?? src.savedAmount ?? '0';

  const durationMonthsValue =
    (typeof src.durationMonths === 'number' ? src.durationMonths : Number(src.durationMonths)) ||
    (typeof src.duration_months === 'string' ? Number(src.duration_months) : Number(src.duration_months)) ||
    (typeof src.months === 'string' ? Number(src.months) : Number(src.months)) ||
    NaN;
  const safeDuration = Number.isFinite(durationMonthsValue) && durationMonthsValue > 0 ? durationMonthsValue : 0;

  const monthlyIncome = toNumber(src.monthlyIncome ?? src.monthly_income ?? src.income ?? 0);
  const monthlyExpense = toNumber(src.monthlyExpense ?? src.monthly_expense ?? src.expense ?? 0);
  const monthlyNetCashFlowRaw = src.monthlyNetCashFlow ?? src.monthly_net_cash_flow ?? src.surplus ?? null;
  const monthlyNetCashFlow =
    typeof monthlyNetCashFlowRaw === 'string' ? toNumber(monthlyNetCashFlowRaw) : toNumber(monthlyNetCashFlowRaw);
  const net = monthlyNetCashFlow > 0 ? monthlyNetCashFlow : Math.max(0, monthlyIncome - monthlyExpense);

  const targetAmountNum = Math.max(0, toNumber(targetAmountRaw));
  const currentAmountNum = Math.max(0, toNumber(currentAmountRaw));
  const remainingAmount = Math.max(0, targetAmountNum - currentAmountNum);
  const requiredMonthlySaving = safeDuration > 0 ? remainingAmount / safeDuration : 0;
  const requiredPercentageOfNet = net > 0 ? Math.round((requiredMonthlySaving / net) * 1000) / 10 : 0;

  let feasibility: 'realistic' | 'tight' | 'unlikely' | 'insufficient_data' = 'insufficient_data';
  if (targetAmountNum > 0 && safeDuration > 0 && net > 0) {
    if (requiredPercentageOfNet <= 60) feasibility = 'realistic';
    else if (requiredPercentageOfNet <= 90) feasibility = 'tight';
    else feasibility = 'unlikely';
  }

  const assumptions = Array.isArray(src.assumptions) ? src.assumptions.filter((x: any): x is string => typeof x === 'string') : [];

  const durationMonths = safeDuration > 0 ? safeDuration : undefined;
  const requiredMonthlySavingValue = safeDuration > 0 ? requiredMonthlySaving : 0;

  return {
    type: 'financial_plan',
    message: typeof raw.message === 'string' ? raw.message : 'Rencana keuangan.',
    data: {
      targetName,
      targetAmount: String(Math.round(targetAmountNum)),
      currentAmount: String(Math.round(currentAmountNum)),
      remainingAmount: String(Math.round(remainingAmount)),
      durationMonths,
      requiredMonthlySaving: String(Math.round(requiredMonthlySavingValue)),
      monthlyIncome: String(Math.round(monthlyIncome)),
      monthlyExpense: String(Math.round(monthlyExpense)),
      monthlyNetCashFlow: String(Math.round(net)),
      requiredPercentageOfNet,
      feasibility,
      assumptions,
      relatedGoalId: typeof src.relatedGoalId === 'string' ? src.relatedGoalId : typeof src.related_goal_id === 'string' ? src.related_goal_id : null,
    },
    payload: {
      goal: typeof src.goal === 'string' ? src.goal : targetName || undefined,
      duration_months: typeof src.duration_months === 'string' ? src.duration_months : durationMonths ? String(durationMonths) : undefined,
      monthly_savings_needed: typeof src.monthly_savings_needed === 'string' ? src.monthly_savings_needed : durationMonths ? String(Math.round(requiredMonthlySavingValue)) : undefined,
      available_monthly_surplus: typeof src.available_monthly_surplus === 'string' ? src.available_monthly_surplus : String(Math.round(net)) || undefined,
      feasibility: typeof src.feasibility === 'string' ? src.feasibility : feasibility,
      suggestion: typeof src.suggestion === 'string' ? src.suggestion : undefined,
    },
  };
}

function normalizeFinancialActionPayload(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const payload = raw.payload || raw;
  if (!payload || typeof payload !== 'object') return raw;

  const action = raw.action || (() => {
    if (payload.transactionType === 'INCOME' || payload.transactionType === 'EXPENSE') return 'create_transaction';
    if (payload.goalId || payload.goalName) return 'goal_contribution';
    if (payload.sourceWalletId || payload.sourceWalletName || payload.destinationWalletId || payload.destinationWalletName) return 'transfer';
    return 'create_transaction';
  })();

  const message = typeof raw.message === 'string' && raw.message.trim().length > 0 ? raw.message : 'Silakan konfirmasi detail berikut sebelum disimpan:';

  return {
    type: 'financial_action',
    action,
    message,
    payload: {
      transactionType: typeof payload.transactionType === 'string' ? payload.transactionType : undefined,
      amount: typeof payload.amount === 'string' ? payload.amount : String(payload.amount || '0'),
      description: typeof payload.description === 'string' ? payload.description : undefined,
      category: typeof payload.category === 'string' ? payload.category : undefined,
      walletId: payload.walletId ?? null,
      walletName: payload.walletName ?? null,
      sourceWalletId: payload.sourceWalletId ?? null,
      sourceWalletName: payload.sourceWalletName ?? null,
      destinationWalletId: payload.destinationWalletId ?? null,
      destinationWalletName: payload.destinationWalletName ?? null,
      goalName: payload.goalName ?? null,
      goalId: payload.goalId ?? null,
      date: payload.date ?? null,
    },
    requiresConfirmation: true,
  };
}

export function normalizeGrokResponse(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  if (raw.type === 'financial_plan') {
    return normalizeFinancialPlanData(raw);
  }
  if (raw.type === 'financial_action') {
    return normalizeFinancialActionPayload(raw);
  }
  return raw;
}
