import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-response';
import { AIChatRequestSchema } from '@/lib/ai/ai.schemas';
import { callGrok, GrokConfigurationError, GrokRateLimitError, GrokApiError, isGrokConfigured, getActiveProvider } from '@/lib/ai/grok';
import { FINAI_GROK_MODEL, FINAI_XAI_MODEL } from '@/lib/ai/ai.prompts';

// ---------------------------------------------------------------------------
// POST /api/ai/chat — Grok-powered FinAI Assistant
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Authenticate — user identity from session, never from client
  const session = await getCurrentUser();
  if (!session) {
    return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
  }

  // 2. Check Grok configuration
  if (!isGrokConfigured()) {
    return apiError('INTERNAL_ERROR', 'FinAI Assistant belum dikonfigurasi. Hubungi administrator.', 500);
  }

  // 3. Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('VALIDATION_ERROR', 'Format request tidak valid', 400);
  }

  const result = AIChatRequestSchema.safeParse(body);
  if (!result.success) {
    return apiError(
      'VALIDATION_ERROR',
      result.error.issues[0]?.message || 'Data tidak valid',
      400,
      result.error.flatten().fieldErrors
    );
  }

  const { message, history } = result.data;

  // 4. Build user context with balances & budget details (server-side, owned data only)
  let wallets: { id: string; name: string; type: string; balance?: string }[] = [];
  let goals: { id: string; name: string; category: string }[] = [];
  let budgets: { category: string; limitAmount?: string; usedAmount?: string; remainingAmount?: string; percentage?: number; status?: string }[] = [];
  let recentTransactions: { description: string; category: string; type: string; amount: string }[] = [];

  try {
    const [walletRows, goalRows, txRows] = await Promise.all([
      prisma.wallet.findMany({
        where: { userId: session.userId },
        select: { id: true, name: true, type: true, balance: true },
        orderBy: { createdAt: 'asc' },
        take: 20,
      }),
      prisma.goal.findMany({
        where: { userId: session.userId },
        select: { id: true, name: true, category: true },
        orderBy: { createdAt: 'asc' },
        take: 20,
      }),
      prisma.transaction.findMany({
        where: { userId: session.userId },
        select: { description: true, category: true, type: true, amount: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    wallets = walletRows.map((w) => ({ id: w.id, name: w.name, type: w.type, balance: w.balance.toString() }));
    goals = goalRows.map((g) => ({ id: g.id, name: g.name, category: g.category }));
    recentTransactions = txRows.map((t) => ({
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount.toString(),
    }));

    // Budgets with enriched usage (limit, used, remaining, percentage)
    try {
      const { BudgetService } = await import('@/lib/services/budget.service');
      const enriched = await BudgetService.getBudgets(session.userId);
      budgets = enriched.map((b: any) => ({
        category: b.category,
        limitAmount: b.limitAmount?.toString(),
        usedAmount: b.usedAmount?.toString(),
        remainingAmount: b.remainingAmount?.toString(),
        percentage: b.percentage,
        status: b.status,
      }));
    } catch {
      // Fallback simple
      const budgetRows = await prisma.budget.findMany({
        where: { userId: session.userId },
        select: { category: true },
        take: 20,
      });
      budgets = budgetRows.map((b) => ({ category: b.category }));
    }
  } catch (err) {
    console.error('AI chat: failed to build user context', err);
    // Continue — context is optional, Grok can still respond
  }

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // 5. Call Grok (server-side only — API key never leaves server)
  try {
    const grokResponse = await callGrok({
      message,
      history,
      context: {
        wallets,
        goals,
        budgets,
        recentTransactions,
        currentDate,
      },
    });

    // 6. Return safe response — never expose internal fields
    const activeProvider = getActiveProvider();
    const activeModel = activeProvider === 'groq' ? FINAI_GROK_MODEL : activeProvider === 'xai' ? FINAI_XAI_MODEL : 'unknown';
    return apiSuccess({
      response: grokResponse,
      meta: {
        provider: activeProvider,
        model: activeModel,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof GrokConfigurationError) {
      return apiError('INTERNAL_ERROR', 'FinAI Assistant belum dikonfigurasi.', 500);
    }
    if (err instanceof GrokRateLimitError) {
      return apiError('INTERNAL_ERROR', err.message, 429);
    }
    if (err instanceof GrokApiError) {
      const status = err.status === 401 ? 500 : err.status >= 400 && err.status < 500 ? err.status : 500;
      // Map 401 from Grok → 500 (don't expose provider auth details)
      const safeStatus = err.status === 401 ? 500 : status;
      return apiError('INTERNAL_ERROR', err.message, safeStatus);
    }

    console.error('AI chat: unexpected error', err);
    return apiError('INTERNAL_ERROR', 'FinAI Assistant mengalami kendala. Coba lagi beberapa saat.', 500);
  }
}
