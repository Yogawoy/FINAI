import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { CreateBudgetInput, UpdateBudgetInput } from '@/lib/validations/budget';

export type BudgetHealthStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export class BudgetNotFoundError extends Error {
  constructor(message: string = 'Pos anggaran tidak ditemukan atau bukan milik Anda') {
    super(message);
    this.name = 'BudgetNotFoundError';
  }
}

export class BudgetConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetConflictError';
  }
}

export class BudgetService {
  private static async enrichBudgetUsage<T extends {
    id: string;
    userId: string;
    category: string;
    limitAmount: Prisma.Decimal;
    month: number;
    year: number;
    createdAt: Date;
    updatedAt: Date;
  }>(budgets: T[]) {
    if (budgets.length === 0) return [];

    const periods = new Map<string, { month: number; year: number }>();
    for (const budget of budgets) {
      periods.set(`${budget.year}-${budget.month}`, { month: budget.month, year: budget.year });
    }

    const expenseQueries = Array.from(periods.values()).map(({ month, year }) => {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      return prisma.transaction.findMany({
        where: {
          userId: budgets[0].userId,
          type: 'EXPENSE',
          transactionDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          category: true,
          amount: true,
          transactionDate: true,
        },
      });
    });

    const expenseResults = await Promise.all(expenseQueries);
    const expenseByPeriodAndCategory = new Map<string, Prisma.Decimal>();

    for (const expenses of expenseResults) {
      for (const expense of expenses) {
        const month = expense.transactionDate.getMonth() + 1;
        const year = expense.transactionDate.getFullYear();
        const key = `${year}-${month}-${expense.category.toLowerCase().trim()}`;
        const current = expenseByPeriodAndCategory.get(key) || new Prisma.Decimal(0);
        expenseByPeriodAndCategory.set(key, current.plus(expense.amount));
      }
    }

    return budgets.map((budget) => {
      const key = `${budget.year}-${budget.month}-${budget.category.toLowerCase().trim()}`;
      const usedAmount = expenseByPeriodAndCategory.get(key) || new Prisma.Decimal(0);
      const remainingAmount = budget.limitAmount.minus(usedAmount);
      const percentage = budget.limitAmount.gt(0)
        ? Math.round(usedAmount.mul(100).div(budget.limitAmount).toNumber())
        : 0;

      let status: BudgetHealthStatus = 'SAFE';
      if (percentage > 90) {
        status = 'CRITICAL';
      } else if (percentage >= 70) {
        status = 'WARNING';
      }

      return {
        ...budget,
        usedAmount,
        remainingAmount,
        percentage,
        status,
      };
    });
  }

  /**
   * Get all budgets for month/year with computed usage
   */
  static async getBudgets(userId: string, month?: number, year?: number) {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return this.enrichBudgetUsage(budgets);
  }

  static async getBudgetById(userId: string, budgetId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!budget) return null;

    const [enriched] = await this.enrichBudgetUsage([budget]);
    return enriched || null;
  }

  /**
   * Create new budget for user
   */
  static async createBudget(userId: string, input: CreateBudgetInput) {
    const { category, limitAmount, month, year } = input;

    const existing = await prisma.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month,
          year,
        },
      },
    });

    if (existing) {
      throw new BudgetConflictError(`Anggaran untuk kategori '${category}' pada periode ini sudah dibuat`);
    }

    return prisma.budget.create({
      data: {
        userId,
        category,
        limitAmount: new Prisma.Decimal(limitAmount),
        month,
        year,
      },
    });
  }

  /**
   * Update budget with ownership check
   */
  static async updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!existing) {
      throw new BudgetNotFoundError();
    }

    const category = input.category ?? existing.category;
    const month = input.month ?? existing.month;
    const year = input.year ?? existing.year;

    const duplicate = await prisma.budget.findFirst({
      where: {
        id: { not: budgetId },
        userId,
        category,
        month,
        year,
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new BudgetConflictError(`Anggaran untuk kategori '${category}' pada periode ini sudah dibuat`);
    }

    const data: Prisma.BudgetUpdateInput = {};
    if (input.category !== undefined) data.category = input.category;
    if (input.limitAmount !== undefined) data.limitAmount = new Prisma.Decimal(input.limitAmount);
    if (input.month !== undefined) data.month = input.month;
    if (input.year !== undefined) data.year = input.year;

    return prisma.budget.update({
      where: { id: budgetId },
      data,
    });
  }

  /**
   * Delete budget with ownership check
   */
  static async deleteBudget(userId: string, budgetId: string) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new BudgetNotFoundError();
    }

    return prisma.budget.delete({
      where: { id: budgetId },
    });
  }
}
