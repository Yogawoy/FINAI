import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  CreateGoalInput,
  UpdateGoalInput,
  CreateGoalContributionInput,
} from '@/lib/validations/goal';

export class GoalService {
  /**
   * Helper to compute goal metrics
   */
  private static computeGoalMetrics(goal: {
    targetAmount: Prisma.Decimal;
    currentAmount: Prisma.Decimal;
    deadline: Date;
  }) {
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    const remaining = Math.max(0, target - current);
    const remainingDecimal = new Prisma.Decimal(remaining);

    const progressPercentage =
      target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    // Calculate remaining months until deadline
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffYears = deadline.getFullYear() - now.getFullYear();
    const diffMonths = deadline.getMonth() - now.getMonth() + diffYears * 12;
    const remainingMonths = Math.max(1, diffMonths);

    const recommendedMonthlySaving = new Prisma.Decimal(
      Math.round(remaining / remainingMonths)
    );

    return {
      remainingAmount: remainingDecimal,
      progressPercentage,
      remainingMonths,
      recommendedMonthlySaving,
    };
  }

  /**
   * Get all goals with computed financial metrics
   */
  static async getGoals(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        contributions: {
          orderBy: { contributionDate: 'desc' },
          take: 5,
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return goals.map((g) => ({
      ...g,
      ...this.computeGoalMetrics(g),
    }));
  }

  /**
   * Get single goal by ID with computed metrics
   */
  static async getGoalById(userId: string, goalId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        contributions: {
          include: {
            sourceWallet: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: { contributionDate: 'desc' },
        },
      },
    });

    if (!goal) return null;

    return {
      ...goal,
      ...this.computeGoalMetrics(goal),
    };
  }

  /**
   * Create new goal
   */
  static async createGoal(userId: string, input: CreateGoalInput) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: input.name,
        category: input.category,
        targetAmount: new Prisma.Decimal(input.targetAmount),
        currentAmount: new Prisma.Decimal(input.currentAmount ?? 0),
        deadline: new Date(input.deadline),
        sourceWalletId: input.sourceWalletId || null,
        destinationWalletId: input.destinationWalletId || null,
        frequency: input.frequency || 'MONTHLY',
      },
    });

    return {
      ...goal,
      ...this.computeGoalMetrics(goal),
    };
  }

  /**
   * Update goal
   */
  static async updateGoal(userId: string, goalId: string, input: UpdateGoalInput) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) return null;

    const data: Prisma.GoalUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.category !== undefined) data.category = input.category;
    if (input.targetAmount !== undefined) data.targetAmount = new Prisma.Decimal(input.targetAmount);
    if (input.currentAmount !== undefined) data.currentAmount = new Prisma.Decimal(input.currentAmount);
    if (input.deadline !== undefined) data.deadline = new Date(input.deadline);
    if (input.sourceWalletId !== undefined) data.sourceWalletId = input.sourceWalletId;
    if (input.destinationWalletId !== undefined) data.destinationWalletId = input.destinationWalletId;
    if (input.frequency !== undefined) data.frequency = input.frequency;

    const updated = await prisma.goal.update({
      where: { id: goalId },
      data,
    });

    return {
      ...updated,
      ...this.computeGoalMetrics(updated),
    };
  }

  /**
   * Delete goal
   */
  static async deleteGoal(userId: string, goalId: string) {
    const existing = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!existing) return null;

    return prisma.goal.delete({
      where: { id: goalId },
    });
  }

  /**
   * Add Goal Contribution with atomic database transaction
   */
  static async addGoalContribution(
    userId: string,
    goalId: string,
    input: CreateGoalContributionInput
  ) {
    const { sourceWalletId, amount, contributionDate } = input;
    const contributionAmount = new Prisma.Decimal(amount);

    return prisma.$transaction(async (tx) => {
      // 1. Verify goal ownership
      const goal = await tx.goal.findFirst({
        where: { id: goalId, userId },
      });

      if (!goal) {
        throw new Error('Target impian tidak ditemukan atau bukan milik Anda');
      }

      // 2. Verify source wallet ownership
      const sourceWallet = await tx.wallet.findFirst({
        where: { id: sourceWalletId, userId },
      });

      if (!sourceWallet) {
        throw new Error('Dompet sumber tidak ditemukan atau bukan milik Anda');
      }

      // 3. Verify sufficient balance
      if (sourceWallet.balance.lessThan(contributionAmount)) {
        throw new Error('Saldo dompet sumber tidak mencukupi untuk setoran target');
      }

      // 4. Debit source wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: sourceWalletId },
        data: {
          balance: {
            decrement: contributionAmount,
          },
        },
      });

      // 5. Increment goal currentAmount
      const updatedGoal = await tx.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: {
            increment: contributionAmount,
          },
        },
      });

      const txDate = contributionDate ? new Date(contributionDate) : new Date();

      // 6. Create GoalContribution record
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          sourceWalletId,
          amount: contributionAmount,
          contributionDate: txDate,
        },
      });

      // 7. Create Expense Transaction record linked to the wallet
      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: sourceWalletId,
          type: 'EXPENSE',
          amount: contributionAmount,
          category: 'Tabungan & Investasi',
          description: `Setoran Target: ${goal.name}`,
          transactionDate: txDate,
        },
      });

      return {
        contribution,
        transaction,
        goal: {
          ...updatedGoal,
          ...this.computeGoalMetrics(updatedGoal),
        },
        wallet: updatedWallet,
      };
    });
  }
}
