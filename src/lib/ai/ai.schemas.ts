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
  goals: { id: string; name: string; category: string }[];
  budgets: { category: string; limitAmount?: string; usedAmount?: string; remainingAmount?: string; percentage?: number; status?: string }[];
  recentTransactions: { description: string; category: string; type: string; amount: string }[];
  currentDate: string;
}
