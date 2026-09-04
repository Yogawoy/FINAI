import { Prisma } from '@prisma/client';

export interface SerializedBudget {
  id: string;
  userId: string;
  category: string;
  limitAmount: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  usedAmount?: string;
  remainingAmount?: string;
  percentage?: number;
  status?: 'SAFE' | 'WARNING' | 'CRITICAL';
}

function formatDecimal(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

export function serializeBudget(budget: {
  id: string;
  userId: string;
  category: string;
  limitAmount: Prisma.Decimal;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
  usedAmount?: Prisma.Decimal;
  remainingAmount?: Prisma.Decimal;
  percentage?: number;
  status?: 'SAFE' | 'WARNING' | 'CRITICAL';
}): SerializedBudget {
  return {
    id: budget.id,
    userId: budget.userId,
    category: budget.category,
    limitAmount: formatDecimal(budget.limitAmount),
    month: budget.month,
    year: budget.year,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
    ...(budget.usedAmount ? { usedAmount: formatDecimal(budget.usedAmount) } : {}),
    ...(budget.remainingAmount ? { remainingAmount: formatDecimal(budget.remainingAmount) } : {}),
    ...(budget.percentage !== undefined ? { percentage: budget.percentage } : {}),
    ...(budget.status ? { status: budget.status } : {}),
  };
}

export function serializeBudgets(budgets: Array<Parameters<typeof serializeBudget>[0]>): SerializedBudget[] {
  return budgets.map(serializeBudget);
}
