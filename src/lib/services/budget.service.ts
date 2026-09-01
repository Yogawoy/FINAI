import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { CreateBudgetInput, UpdateBudgetInput } from '@/lib/validations/budget';

export type BudgetHealthStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

export class BudgetService {
  /**
   * Get all budgets for month/year with computed usedAmount, remainingAmount, percentage, and status
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
      orderBy: { createdAt: 'desc' },
    });

    // Start & end of requested month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Fetch all expense transactions for this user within this month
    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    // Aggregate expense by category
    const expenseByCategory = new Map<string, Prisma.Decimal>();
    for (const exp of expenses) {
      const cat = exp.category.toLowerCase().trim();
      const current = expenseByCategory.get(cat) || new Prisma.Decimal(0);
      expenseByCategory.set(cat, current.plus(exp.amount));
    }

    return budgets.map((b) => {
      const usedDecimal = expenseByCategory.get(b.category.toLowerCase().trim()) || new Prisma.Decimal(0);
      const limitDecimal = b.limitAmount;
      const remainingDecimal = limitDecimal.minus(usedDecimal);

      const limitNum = Number(limitDecimal);
      const usedNum = Number(usedDecimal);
      const percentage = limitNum > 0 ? Math.round((usedNum / limitNum) * 100) : 0;

      let status: BudgetHealthStatus = 'SAFE';
      if (percentage > 90) {
        status = 'CRITICAL';
      } else if (percentage >= 70) {
        status = 'WARNING';
      }

      return {
        ...b,
        usedAmount: usedDecimal,
        remainingAmount: remainingDecimal,
        percentage,
        status,
      };
    });
  }

  /**
   * Create new budget for user
   */
  static async createBudget(userId: string, input: CreateBudgetInput) {
    const { category, limitAmount, month, year } = input;

    // Check if budget for same category and month/year already exists
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
      throw new Error(`Anggaran untuk kategori '${category}' pada periode ini sudah dibuat`);
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

    if (!existing) return null;

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
    });

    if (!existing) return null;

    return prisma.budget.delete({
      where: { id: budgetId },
    });
  }
}
