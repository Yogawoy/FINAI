import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { BudgetService } from '@/lib/services/budget.service';
import type { GrokUserContext } from './ai.schemas';

function toMinorUnits(value: unknown): string {
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(num) || num < 0) return '0';
  return Math.round(num).toString();
}

function safeNum(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(num) ? num : 0;
}

function safeMonths(value: unknown): number {
  const num = safeNum(value);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.ceil(num);
}

function formatIDR(value: number): string {
  if (!Number.isFinite(value) || value < 0) return 'Rp0';
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp${Math.round(value)}`;
  }
}

export interface PlanningGoalInput {
  id?: string | null;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
}

export interface FinancialPlanCalculation {
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
}

export async function buildFinancialContext(userId: string): Promise<GrokUserContext> {
  const [walletRows, goalRows, goalContributionRows, txRows, budgetRows] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId },
      select: { id: true, name: true, type: true, balance: true },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    prisma.goal.findMany({
      where: { userId },
      select: { id: true, name: true, category: true, targetAmount: true, currentAmount: true, deadline: true },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    prisma.goalContribution.findMany({
      where: { goal: { userId } },
      select: { amount: true, contributionDate: true },
      orderBy: { contributionDate: 'desc' },
      take: 100,
    }),
    prisma.transaction.findMany({
      where: { userId },
      select: { description: true, category: true, type: true, amount: true, transactionDate: true },
      orderBy: { transactionDate: 'desc' },
      take: 200,
    }),
    prisma.budget.findMany({
      where: { userId },
      select: { category: true, limitAmount: true },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
  ]);

  const wallets = walletRows.map((w) => ({ id: w.id, name: w.name, type: w.type, balance: w.balance.toString() }));
  const goals = goalRows.map((g) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    targetAmount: g.targetAmount.toString(),
    currentAmount: g.currentAmount.toString(),
    remainingAmount: new Prisma.Decimal(g.targetAmount).minus(g.currentAmount).toString(),
    percentage:
      Number(g.targetAmount) > 0
        ? Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 1000) / 10
        : 0,
    deadline: g.deadline ? g.deadline.toISOString() : null,
  }));

  const totalWallets = walletRows.reduce((acc, w) => acc + Number(w.balance), 0);
  const income = txRows.filter((t) => String(t.type).toUpperCase() === 'INCOME').reduce((acc, t) => acc + Number(t.amount), 0);
  const expense = txRows.filter((t) => String(t.type).toUpperCase() === 'EXPENSE').reduce((acc, t) => acc + Number(t.amount), 0);
  const remaining = totalWallets + income - expense;
  const monthlyIncome = income;
  const monthlyExpense = expense;
  const monthlyNetCashFlow = Math.max(0, monthlyIncome - monthlyExpense);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  const currentPeriodLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  const financialSummary = {
    period: currentPeriodLabel,
    income: toMinorUnits(income),
    expense: toMinorUnits(expense),
    remaining: toMinorUnits(remaining),
    activeGoals: goals.length,
  };

  const categoryMap = new Map<string, number>();
  for (const t of txRows) {
    if (String(t.type).toUpperCase() === 'EXPENSE') {
      const key = t.category || 'other';
      categoryMap.set(key, (categoryMap.get(key) || 0) + Number(t.amount));
    }
  }

  const totalExpense = safeNum(financialSummary.expense);
  const categoryTotals = {
    items: Array.from(categoryMap.entries())
      .map(([category, total]) => ({
        category,
        total: toMinorUnits(total),
        percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 1000) / 10 : 0,
      }))
      .sort((a, b) => safeNum(b.total) - safeNum(a.total))
      .slice(0, 5),
    period: currentPeriodLabel,
  };

  const recentTransactions = txRows.slice(0, 5).map((t) => ({
    description: t.description,
    category: t.category,
    type: t.type,
    amount: toMinorUnits(t.amount),
  }));

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const currentMonthExpense = txRows
    .filter((t) => String(t.type).toUpperCase() === 'EXPENSE' && new Date(t.transactionDate) >= currentMonthStart)
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const previousMonthExpense = txRows
    .filter((t) => String(t.type).toUpperCase() === 'EXPENSE' && new Date(t.transactionDate) >= previousMonthStart && new Date(t.transactionDate) <= previousMonthEnd)
    .reduce((acc, t) => acc + Number(t.amount), 0);

  let changePercentage: number | undefined;
  if (previousMonthExpense > 0) {
    changePercentage = Math.round(((currentMonthExpense - previousMonthExpense) / previousMonthExpense) * 1000) / 10;
  } else if (currentMonthExpense > 0) {
    changePercentage = 100;
  }

  const trend = {
    currentPeriodExpense: toMinorUnits(currentMonthExpense),
    previousPeriodExpense: previousMonthExpense > 0 ? toMinorUnits(previousMonthExpense) : undefined,
    changePercentage,
  };

  let budgets: GrokUserContext['budgets'] = [];
  try {
    const enriched = await BudgetService.getBudgets(userId);
    budgets = enriched.map((b: any) => ({
      category: b.category,
      limitAmount: toMinorUnits(b.limitAmount ?? 0),
      usedAmount: toMinorUnits(b.usedAmount ?? 0),
      remainingAmount: toMinorUnits(b.remainingAmount ?? 0),
      percentage: b.percentage,
      status: b.status,
    }));
  } catch {
    budgets = budgetRows.map((b) => ({ category: b.category, limitAmount: toMinorUnits(b.limitAmount) }));
  }

  return {
    wallets,
    goals,
    budgets,
    recentTransactions,
    currentDate: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    financialSummary,
    categoryTotals,
    trend,
    monthlyIncome: toMinorUnits(monthlyIncome),
    monthlyExpense: toMinorUnits(monthlyExpense),
    monthlyNetCashFlow: toMinorUnits(monthlyNetCashFlow),
  };
}

export function calculateFinancialPlan(args: {
  targetName: string;
  targetAmount: number;
  currentAmount?: number;
  durationMonths?: number | null;
  deadline?: string | null;
  monthlyIncome: number;
  monthlyExpense: number;
  relatedGoal?: PlanningGoalInput | null;
}): FinancialPlanCalculation {
  const targetAmount = Math.max(0, args.targetAmount);
  const currentAmount = Math.max(0, args.currentAmount ?? 0);
  const monthlyIncome = Math.max(0, args.monthlyIncome);
  const monthlyExpense = Math.max(0, args.monthlyExpense);
  const monthlyNetCashFlow = Math.max(0, monthlyIncome - monthlyExpense);

  if (targetAmount <= 0 || monthlyNetCashFlow <= 0) {
    return {
      targetName: args.targetName,
      targetAmount: toMinorUnits(targetAmount),
      currentAmount: toMinorUnits(currentAmount),
      remainingAmount: toMinorUnits(Math.max(0, targetAmount - currentAmount)),
      durationMonths: 0,
      requiredMonthlySaving: '0',
      monthlyIncome: toMinorUnits(monthlyIncome),
      monthlyExpense: toMinorUnits(monthlyExpense),
      monthlyNetCashFlow: toMinorUnits(monthlyNetCashFlow),
      requiredPercentageOfNet: 0,
      feasibility: 'insufficient_data',
      assumptions: ['Data bulanan menunjukkan tidak ada surplus yang cukup untuk rencana ini.'],
      relatedGoalId: args.relatedGoal?.id ?? null,
    };
  }

  const safeDuration = safeMonths(args.durationMonths);
  let durationMonths = safeDuration;
  let durationSource = 'user-provided duration';

  if (!durationMonths && args.deadline) {
    const deadlineDate = new Date(args.deadline);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    if (Number.isFinite(deadlineDate.getTime()) && deadlineDate > start) {
      durationMonths = Math.max(
        1,
        Math.ceil(
          (deadlineDate.getFullYear() - start.getFullYear()) * 12 +
            deadlineDate.getMonth() - start.getMonth()
        )
      );
      durationSource = 'deadline';
    }
  }

  if (!durationMonths) {
    return {
      targetName: args.targetName,
      targetAmount: toMinorUnits(targetAmount),
      currentAmount: toMinorUnits(currentAmount),
      remainingAmount: toMinorUnits(Math.max(0, targetAmount - currentAmount)),
      durationMonths: 0,
      requiredMonthlySaving: '0',
      monthlyIncome: toMinorUnits(monthlyIncome),
      monthlyExpense: toMinorUnits(monthlyExpense),
      monthlyNetCashFlow: toMinorUnits(monthlyNetCashFlow),
      requiredPercentageOfNet: 0,
      feasibility: 'insufficient_data',
      assumptions: ['Durasi target belum diberikan. Tentukan mau nabung per minggu atau per bulan.'],
      relatedGoalId: args.relatedGoal?.id ?? null,
    };
  }

  const remaining = Math.max(0, targetAmount - currentAmount);
  const requiredMonthlySaving = remaining / durationMonths;
  const requiredPercentageOfNet =
    monthlyNetCashFlow > 0 ? Math.round((requiredMonthlySaving / monthlyNetCashFlow) * 1000) / 10 : 100;

  let feasibility: FinancialPlanCalculation['feasibility'] = 'insufficient_data';
  if (requiredPercentageOfNet <= 60) {
    feasibility = 'realistic';
  } else if (requiredPercentageOfNet <= 90) {
    feasibility = 'tight';
  } else {
    feasibility = 'unlikely';
  }

  const assumptions: string[] = [
    `Surplus bulanan diperkirakan tetap sekitar ${formatIDR(monthlyNetCashFlow)}.`,
    `Perhitungan menggunakan ${durationSource}.`,
  ];

  if (feasibility === 'tight' || feasibility === 'unlikely') {
    assumptions.push(
      'Jika pola pengeluaran naik, target bisa menjadi lebih sulit dicapai.'
    );
  }

  return {
    targetName: args.targetName,
    targetAmount: toMinorUnits(targetAmount),
    currentAmount: toMinorUnits(currentAmount),
    remainingAmount: toMinorUnits(remaining),
    durationMonths,
    requiredMonthlySaving: toMinorUnits(requiredMonthlySaving),
    monthlyIncome: toMinorUnits(monthlyIncome),
    monthlyExpense: toMinorUnits(monthlyExpense),
    monthlyNetCashFlow: toMinorUnits(monthlyNetCashFlow),
    requiredPercentageOfNet,
    feasibility,
    assumptions,
    relatedGoalId: args.relatedGoal?.id ?? null,
  };
}
