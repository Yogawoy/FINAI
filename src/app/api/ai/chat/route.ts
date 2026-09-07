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

function safeNum(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(num) ? num : 0;
}

function extractPlanningIntent(message: string, context: GrokUserContext): {
  shouldPlan: boolean;
  targetName: string;
  targetAmount: number;
  currentAmount: number;
  durationMonths?: number;
  relatedGoal: PlanningGoalInput | null;
} | null {
  const lower = message.toLowerCase();

  const planningKeywords = [
    'beli', 'nabung', 'target', 'ingin', 'mau', 'capai', 'realisasikan',
    'laptop', 'motor', 'mobil', 'kuliah', 'rumah', 'liburan', 'investasi',
    'tabung', 'menabung', 'perencanaan', 'plan', 'rencana'
  ];

  if (!planningKeywords.some((keyword) => lower.includes(keyword))) return null;

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

  let durationMonths: number | undefined;
  const monthMatch = message.match(/(\d+)\s*bulan/i);
  const yearMatch = message.match(/(\d+)\s*tahun/i);
  const weekMatch = message.match(/(\d+)\s*minggu/i);

  if (monthMatch) durationMonths = parseInt(monthMatch[1], 10);
  else if (yearMatch) durationMonths = parseInt(yearMatch[1], 10) * 12;
  else if (weekMatch) durationMonths = Math.max(1, Math.ceil(parseInt(weekMatch[1], 10) / 4));

  const targetName =
    message
      .replace(/[0-9]+\s*(juta|jt|miliar|bulan|tahun|minggu|rp)/gi, '')
      .replace(/mau|ingin|beli|nabung|target|capai|realisasikan|untuk|dengan|dalam|dari|sampai/gi, '')
      .trim()
      .slice(0, 50) || 'Target Keuangan';

  const goals: PlanningGoalInput[] = (context.goals || []).map((g) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    targetAmount: safeNum(g.targetAmount),
    currentAmount: safeNum(g.currentAmount),
    deadline: g.deadline ?? null,
  }));

  const relatedGoal = goals.find((g) => lower.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(lower.split(' ')[0])) ?? null;

  return {
    shouldPlan: true,
    targetName: relatedGoal?.name || targetName || 'Target Keuangan',
    targetAmount: relatedGoal ? Math.max(0, relatedGoal.targetAmount - (relatedGoal.currentAmount ?? 0)) : targetAmount,
    currentAmount: relatedGoal?.currentAmount ?? 0,
    durationMonths,
    relatedGoal,
  };
}

function createFinancialPlanResponse(plan: {
  targetName: string;
  targetAmount: string;
  currentAmount: string;
  remainingAmount: string;
  durationMonths: number;
  requiredMonthlySaving: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlyNetCashFlow: string;
  requiredPercentageOfNet: number;
  feasibility: 'realistic' | 'tight' | 'unlikely' | 'insufficient_data';
  assumptions: string[];
  relatedGoalId?: string | null;
}, message?: string): GrokStructuredResponse {
  return {
    type: 'financial_plan',
    message: message ?? 'Berikut rencana tabungan bulanan untuk mencapai target tersebut.',
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
      relatedGoalId: plan.relatedGoalId ?? undefined,
    },
    payload: {},
  };
}

function createClarification(message: string, relatedGoal?: PlanningGoalInput | null): GrokStructuredResponse {
  return {
    type: 'clarification',
    message,
    data: relatedGoal?.id
      ? {
          relatedGoalId: relatedGoal.id,
          newGoalHref: '/app/goals?new=true',
          newGoalLabel: 'Buat target baru',
          existingGoalName: relatedGoal.name,
        }
      : {},
  };
}

function resolvePlannedGoal(structured: GrokStructuredResponse, goals: PlanningGoalInput[]): PlanningGoalInput | undefined {
  const relatedId = (structured as any).data?.relatedGoalId as string | null | undefined;
  const existing = goals.find((g) => g.id && g.id === relatedId);
  if (existing) return existing;

  const name = typeof (structured as any).data?.targetName === 'string' ? (structured as any).data.targetName.trim() : '';
  if (!name) return undefined;
  return goals.find((g) => g.name.toLowerCase() === name.toLowerCase());
}

function buildFallbackPlan(
  targetName: string,
  targetAmount: number,
  currentAmount: number,
  durationMonths: number | undefined,
  deadline: string | null | undefined,
  monthlyIncome: number,
  monthlyExpense: number,
  relatedGoal: PlanningGoalInput | null | undefined
): { plan: Awaited<ReturnType<typeof calculateFinancialPlan>>; clarification: GrokStructuredResponse | null } {
  if (!durationMonths) {
    return { plan: null as any, clarification: createClarification(`Untuk merencanakan ${targetName || 'target ini'}, berapa lama kamu ingin menabung? Sebutkan dalam bulan atau tahun, misal "dalam 12 bulan" atau "2 tahun".`, null) };
  }

  if (relatedGoal?.id) {
    return { plan: null as any, clarification: createClarification(`Kamu sudah punya target "${relatedGoal.name}" dengan sisa target Rp ${Number(relatedGoal.targetAmount - relatedGoal.currentAmount).toLocaleString('id-ID')}. Mau tambah setoran ke target itu, atau buat target baru?`, relatedGoal) };
  }

  const plan = calculateFinancialPlan({
    targetName,
    targetAmount,
    currentAmount,
    durationMonths,
    deadline: deadline ?? null,
    monthlyIncome,
    monthlyExpense,
    relatedGoal: relatedGoal ?? undefined,
  });

  return { plan, clarification: null };
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
  }

  if (!isGrokConfigured()) {
    return apiError('INTERNAL_ERROR', 'FinAI Assistant belum dikonfigurasi. Hubungi administrator.', 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('VALIDATION_ERROR', 'Format request tidak valid', 400);
  }

  const parsed = AIChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Data tidak valid', 400, parsed.error.flatten().fieldErrors);
  }

  const { message, history } = parsed.data;

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

  try {
    const grokResponse = await callGrok({ message, history, context });

    const normalized = normalizeGrokResponse(grokResponse);
    let structured: GrokStructuredResponse = normalized;

    if (structured.type === 'financial_action' && structured.action === 'goal_contribution' && (structured as any).payload) {
      const payload = (structured as any).payload;
      const goalName = typeof payload.goalName === 'string' ? payload.goalName.trim() : '';
      const matchedGoal = (context.goals || []).find((g) => g.name.toLowerCase() === goalName.toLowerCase() || (goalName && g.name.toLowerCase().includes(goalName.toLowerCase())));
      if (!matchedGoal) {
        const planningDetected = extractPlanningIntent(message, context);
        if (planningDetected && planningDetected.shouldPlan) {
          const relatedGoal = planningDetected.relatedGoal ?? null;
          const monthlyIncome = safeNum(context.monthlyIncome);
          const monthlyExpense = safeNum(context.monthlyExpense);
          const plan = calculateFinancialPlan({
            targetName: planningDetected.targetName,
            targetAmount: planningDetected.targetAmount,
            currentAmount: planningDetected.currentAmount,
            durationMonths: planningDetected.durationMonths ?? null,
            deadline: relatedGoal?.deadline ?? null,
            monthlyIncome,
            monthlyExpense,
            relatedGoal,
          });

          structured = {
            type: 'financial_plan',
            message: structured.message || 'Kamu belum punya target ini. Berikut rencananya sebelum saya simpan sebagai target.',
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
              relatedGoalId: relatedGoal?.id ?? plan.relatedGoalId ?? null,
            },
            payload: {},
          };
        }
      }
    }

    const planningDetected = extractPlanningIntent(message, context);

    if (structured.type !== 'financial_plan' && planningDetected && planningDetected.shouldPlan) {
      const { clarification, plan } = buildFallbackPlan(
        planningDetected.targetName,
        planningDetected.targetAmount,
        planningDetected.currentAmount,
        planningDetected.durationMonths,
        planningDetected.relatedGoal?.deadline ?? null,
        safeNum(context.monthlyIncome),
        safeNum(context.monthlyExpense),
        planningDetected.relatedGoal
      );

      if (clarification) {
        structured = clarification;
      } else if (plan) {
        structured = createFinancialPlanResponse(plan, structured.message || 'Berikut rencana tabungan bulanan untuk mencapai target tersebut.');
      }
    } else if (structured.type === 'financial_plan' && structured.data && typeof structured.data.targetName === 'string' && typeof structured.data.targetAmount === 'string') {
      const planningGoals: PlanningGoalInput[] = (context.goals || []).map((g) => ({
        id: g.id,
        name: g.name,
        category: g.category,
        targetAmount: safeNum(g.targetAmount),
        currentAmount: safeNum(g.currentAmount),
        deadline: g.deadline ?? null,
      }));
      const related = resolvePlannedGoal(structured, planningGoals);

      const targetAmount = safeNum(structured.data.targetAmount);
      const currentAmount = structured.data.currentAmount ? safeNum(structured.data.currentAmount) : related?.currentAmount ?? 0;
      const monthlyIncome = safeNum(context.monthlyIncome);
      const monthlyExpense = safeNum(context.monthlyExpense);
      const durationMonths = structured.data.durationMonths ?? null;

      if (related?.id) {
        const clarification = createClarification(`Kamu sudah punya target "${related.name}" dengan sisa Rp ${Number(Math.max(0, targetAmount - currentAmount)).toLocaleString('id-ID')}. Mau lanjut setoran ke target itu, atau buat target baru?`, related);
        if (clarification) {
          structured = clarification;
        } else {
          const plan = calculateFinancialPlan({
            targetName: structured.data.targetName,
            targetAmount,
            currentAmount,
            durationMonths,
            deadline: (structured.data as any).deadline ?? related?.deadline ?? null,
            monthlyIncome,
            monthlyExpense,
            relatedGoal: related,
          });
          structured = createFinancialPlanResponse(plan, structured.message);
        }
      } else if (!durationMonths) {
        structured = createClarification(`Berapa lama kamu ingin menabung untuk ${structured.data.targetName}? Sebutkan durasi dalam bulan atau tahun.`, null);
      } else {
        const plan = calculateFinancialPlan({
          targetName: structured.data.targetName,
          targetAmount,
          currentAmount,
          durationMonths,
          deadline: (structured.data as any).deadline ?? null,
          monthlyIncome,
          monthlyExpense,
          relatedGoal: related ?? undefined,
        });
        structured = createFinancialPlanResponse(plan, structured.message);
      }
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
