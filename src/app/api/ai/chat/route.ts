import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-response';
import { AIChatRequestSchema, type GrokStructuredResponse, type GrokUserContext, normalizeGrokResponse } from '@/lib/ai/ai.schemas';
import { callGrok, GrokConfigurationError, GrokRateLimitError, GrokApiError, isGrokConfigured, getActiveProvider } from '@/lib/ai/grok';
import { FINAI_GROK_MODEL, FINAI_XAI_MODEL } from '@/lib/ai/ai.prompts';
import { buildFinancialContext, calculateFinancialPlan, type PlanningGoalInput } from '@/lib/ai/financial-calculations';

// ---------------------------------------------------------------------------
// POST /api/ai/chat — Grok-powered FinAI Assistant
// ---------------------------------------------------------------------------

function toMinorUnits(value: unknown): string {
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(num) || num < 0) return '0';
  return Math.round(num).toString();
}

function safeNum(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(num) ? num : 0;
}

function getPlanningGoalForResponse(response: GrokStructuredResponse, goals: PlanningGoalInput[]): PlanningGoalInput | undefined {
  const relatedId = (response as any).data?.relatedGoalId as string | null | undefined;
  const existing = goals.find((g) => g.id && g.id === relatedId);
  if (existing) return existing;

  const name = typeof (response as any).data?.targetName === 'string' ? (response as any).data.targetName.trim() : '';
  if (!name) return undefined;
  const match = goals.find((g) => g.name.toLowerCase() === name.toLowerCase());
  return match;
}

function detectPlanningIntent(message: string, context: GrokUserContext): {
  shouldPlan: boolean;
  targetName: string;
  targetAmount: number;
  currentAmount: number;
  durationMonths?: number;
  deadline?: string | null;
  relatedGoal?: PlanningGoalInput | null;
} | null {
  const lower = message.toLowerCase();
  
  // Check for planning keywords
  const planningKeywords = [
    'beli', 'nabung', 'target', 'ingin', 'mau', 'capai', 'realisasikan',
    'laptop', 'motor', 'mobil', 'kuliah', 'rumah', 'liburan', 'investasi',
    'tabung', 'menabung', 'perencanaan', 'plan', 'rencana'
  ];
  
  const hasPlanningKeyword = planningKeywords.some(keyword => lower.includes(keyword));
  if (!hasPlanningKeyword) return null;
  
  // Extract amount from message
  const amountPatterns = [
    /(\d+)\s*juta/i,
    /(\d+)\s*jt/i,
    /(\d+)\s*miliar/i,
    /(\d+)\s*000\s*000/i,
    /rp\s*(\d+)/i,
  ];
  
  let targetAmount = 0;
  for (const pattern of amountPatterns) {
    const match = message.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0) {
        targetAmount = num * (pattern.source.includes('juta') ? 1000000 : pattern.source.includes('miliar') ? 1000000000 : 1);
        break;
      }
    }
  }
  
  if (targetAmount <= 0) return null;
  
  // Extract duration from message
  const monthMatch = message.match(/(\d+)\s*bulan/i);
  const yearMatch = message.match(/(\d+)\s*tahun/i);
  let durationMonths: number | undefined;
  
  if (monthMatch) {
    durationMonths = parseInt(monthMatch[1], 10);
  } else if (yearMatch) {
    durationMonths = parseInt(yearMatch[1], 10) * 12;
  }
  
  // Extract target name from message
  const targetName = message
    .replace(/[0-9]+\s*(juta|jt|miliar|bulan|tahun|rp)/gi, '')
    .replace(/mau|ingin|beli|nabung|target|capai|realisasikan|untuk|dengan|dalam|dari|sampai/gi, '')
    .trim()
    .slice(0, 50) || 'Target Keuangan';
  
  // Check if any existing goal matches
  const goals: PlanningGoalInput[] = (context.goals || []).map((g) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    targetAmount: safeNum(g.targetAmount),
    currentAmount: safeNum(g.currentAmount),
    deadline: g.deadline ?? null,
  }));
  
  const relatedGoal = goals.find(g => 
    lower.includes(g.name.toLowerCase()) || 
    g.name.toLowerCase().includes(lower.split(' ')[0])
  ) ?? null;
  
  const currentAmount = relatedGoal?.currentAmount ?? 0;
  
  return {
    shouldPlan: true,
    targetName: relatedGoal?.name || targetName || 'Target Keuangan',
    targetAmount: relatedGoal ? Math.max(0, relatedGoal.targetAmount - currentAmount) : targetAmount,
    currentAmount,
    durationMonths,
    deadline: null,
    relatedGoal,
  };
}

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

  // 4. Build user context with actual financial data (server-side, owned data only)
  let context: GrokUserContext;
  try {
    context = await buildFinancialContext(session.userId);
  } catch (err) {
    console.error('AI chat: failed to build user context', err);
    context = {
      wallets: [],
      goals: [],
      budgets: [],
      recentTransactions: [],
      currentDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      financialSummary: undefined,
      categoryTotals: undefined,
      trend: undefined,
    };
  }

  // 5. Call Grok (server-side only — API key never leaves server)
  try {
    const grokResponse = await callGrok({
      message,
      history,
      context,
    });

    const normalized = normalizeGrokResponse(grokResponse);
    let structured: GrokStructuredResponse = normalized;

    // Fallback deterministic planning if Groq did not return financial_plan
    const planningDetected = detectPlanningIntent(message, context);
    if (structured.type !== 'financial_plan' && planningDetected && planningDetected.shouldPlan) {
      const monthlyIncome = safeNum(context.monthlyIncome);
      const monthlyExpense = safeNum(context.monthlyExpense);
      const plan = calculateFinancialPlan({
        targetName: planningDetected.targetName,
        targetAmount: planningDetected.targetAmount,
        currentAmount: planningDetected.currentAmount,
        durationMonths: planningDetected.durationMonths ?? null,
        deadline: planningDetected.deadline ?? planningDetected.relatedGoal?.deadline ?? null,
        monthlyIncome,
        monthlyExpense,
        relatedGoal: planningDetected.relatedGoal ?? undefined,
      });

      structured = {
        type: 'financial_plan',
        message: structured.message || 'Berikut rencana tabungan bulanan untuk mencapai target tersebut.',
        data: {
          targetName: plan.targetName,
          targetAmount: plan.targetAmount,
          currentAmount: plan.currentAmount,
          remainingAmount: plan.remainingAmount,
          durationMonths: plan.durationMonths,
          requiredMonthlySaving: plan.requiredMonthlySaving,
          monthlyIncome: plan.monthlyIncome,
          monthlyExpense: plan.monthlyExpense,
          monthlyNetCashFlow: plan.monthlyNetCashFlow,
          requiredPercentageOfNet: plan.requiredPercentageOfNet,
          feasibility: plan.feasibility,
          assumptions: plan.assumptions,
          relatedGoalId: planningDetected.relatedGoal?.id ?? plan.relatedGoalId ?? null,
        },
        payload: {},
      };
    } else if (structured.type === 'financial_plan' && structured.data && typeof structured.data.targetName === 'string' && typeof structured.data.targetAmount === 'string') {
      const planningGoals: PlanningGoalInput[] = (context.goals || []).map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        targetAmount: safeNum(g.targetAmount),
        currentAmount: safeNum(g.currentAmount),
        deadline: g.deadline ?? null,
      }));
      const related = getPlanningGoalForResponse(structured, planningGoals);

      const targetAmount = safeNum(structured.data.targetAmount);
      const currentAmount = structured.data.currentAmount ? safeNum(structured.data.currentAmount) : related?.currentAmount ?? 0;
      const monthlyIncome = safeNum(context.monthlyIncome);
      const monthlyExpense = safeNum(context.monthlyExpense);

      const plan = calculateFinancialPlan({
        targetName: structured.data.targetName,
        targetAmount,
        currentAmount,
        durationMonths: structured.data.durationMonths ?? null,
        deadline: (structured.data as any).deadline ?? related?.deadline ?? null,
        monthlyIncome,
        monthlyExpense,
        relatedGoal: related,
      });

      structured = {
        type: 'financial_plan',
        message: structured.message,
        data: {
          targetName: plan.targetName,
          targetAmount: plan.targetAmount,
          currentAmount: plan.currentAmount,
          remainingAmount: plan.remainingAmount,
          durationMonths: plan.durationMonths,
          requiredMonthlySaving: plan.requiredMonthlySaving,
          monthlyIncome: plan.monthlyIncome,
          monthlyExpense: plan.monthlyExpense,
          monthlyNetCashFlow: plan.monthlyNetCashFlow,
          requiredPercentageOfNet: plan.requiredPercentageOfNet,
          feasibility: plan.feasibility,
          assumptions: plan.assumptions,
          relatedGoalId: related?.id ?? plan.relatedGoalId ?? null,
        },
        payload: {},
      };
    }

    const activeProvider = getActiveProvider();
    const activeModel = activeProvider === 'groq' ? FINAI_GROK_MODEL : activeProvider === 'xai' ? FINAI_XAI_MODEL : 'unknown';
    return apiSuccess({
      response: structured,
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
      const safeStatus = err.status === 401 ? 500 : status;
      return apiError('INTERNAL_ERROR', err.message, safeStatus);
    }

    console.error('AI chat: unexpected error', err);
    return apiError('INTERNAL_ERROR', 'FinAI Assistant mengalami kendala. Coba lagi beberapa saat.', 500);
  }
}
