import { GoalFrequency, Prisma, WalletType } from '@prisma/client';

interface GoalWalletSummary {
  id: string;
  name: string;
  type: WalletType;
  institution?: string | null;
}

interface GoalContributionSummary {
  id: string;
  goalId: string;
  sourceWalletId: string;
  amount: string;
  contributionDate: string;
  createdAt: string;
  sourceWallet?: GoalWalletSummary;
}

export interface SerializedGoal {
  id: string;
  userId: string;
  name: string;
  category: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  frequency: string;
  autoDeposit?: boolean;
  nextDueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  remainingAmount?: string;
  progressPercentage?: number;
  remainingMonths?: number;
  recommendedMonthlySaving?: string;
}

function formatDecimal(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

export function serializeGoal(goal: {
  id: string;
  userId: string;
  name: string;
  category: string;
  targetAmount: Prisma.Decimal;
  currentAmount: Prisma.Decimal;
  deadline: Date;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  frequency: GoalFrequency;
  autoDeposit?: boolean;
  nextDueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  remainingAmount?: Prisma.Decimal;
  progressPercentage?: number;
  remainingMonths?: number;
  recommendedMonthlySaving?: Prisma.Decimal;
  sourceWallet?: GoalWalletSummary | null;
  destinationWallet?: GoalWalletSummary | null;
  contributions?: Array<{
    id: string;
    goalId: string;
    sourceWalletId: string;
    amount: Prisma.Decimal;
    contributionDate: Date;
    createdAt: Date;
    sourceWallet?: GoalWalletSummary;
  }>;
}): SerializedGoal {
  return {
    id: goal.id,
    userId: goal.userId,
    name: goal.name,
    category: goal.category,
    targetAmount: formatDecimal(goal.targetAmount),
    currentAmount: formatDecimal(goal.currentAmount),
    deadline: goal.deadline.toISOString(),
    sourceWalletId: goal.sourceWalletId,
    destinationWalletId: goal.destinationWalletId,
    frequency: goal.frequency,
    autoDeposit: (goal as any).autoDeposit ?? false,
    nextDueDate: (goal as any).nextDueDate ? (goal as any).nextDueDate.toISOString() : null,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    ...(goal.remainingAmount ? { remainingAmount: formatDecimal(goal.remainingAmount) } : {}),
    ...(goal.progressPercentage !== undefined ? { progressPercentage: goal.progressPercentage } : {}),
    ...(goal.remainingMonths !== undefined ? { remainingMonths: goal.remainingMonths } : {}),
    ...(goal.recommendedMonthlySaving
      ? { recommendedMonthlySaving: formatDecimal(goal.recommendedMonthlySaving) }
      : {}),
    ...(goal.sourceWallet !== undefined ? { sourceWallet: goal.sourceWallet } : {}),
    ...(goal.destinationWallet !== undefined ? { destinationWallet: goal.destinationWallet } : {}),
    ...(goal.contributions
      ? {
          contributions: goal.contributions.map((contribution) => ({
            id: contribution.id,
            goalId: contribution.goalId,
            sourceWalletId: contribution.sourceWalletId,
            amount: formatDecimal(contribution.amount),
            contributionDate: contribution.contributionDate.toISOString(),
            createdAt: contribution.createdAt.toISOString(),
            ...(contribution.sourceWallet ? { sourceWallet: contribution.sourceWallet } : {}),
          })),
        }
      : {}),
  };
}

export function serializeGoals(goals: Array<Parameters<typeof serializeGoal>[0]>): SerializedGoal[] {
  return goals.map(serializeGoal);
}
