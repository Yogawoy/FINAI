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
    const freq = (input.frequency as string) || 'MONTHLY';
    const nextDue = new Date();
    if (freq === 'WEEKLY') nextDue.setDate(nextDue.getDate() + 7);
    else nextDue.setMonth(nextDue.getMonth() + 1);
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: input.name,
        category: input.category,
        targetAmount: new Prisma.Decimal(input.targetAmount),
        deadline: new Date(input.deadline),
        sourceWalletId: input.sourceWalletId || null,
        destinationWalletId: input.destinationWalletId || null,
        frequency: (freq as any) || 'MONTHLY',
        autoDeposit: input.autoDeposit ?? false,
        nextDueDate: input.autoDeposit ? nextDue : null,
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
    if (input.deadline !== undefined) data.deadline = new Date(input.deadline);
    if (input.frequency !== undefined) {
      (data as any).frequency = input.frequency;
      // auto-recalculate nextDueDate when frequency changes and autoDeposit is on
      if ((existing as any).autoDeposit) {
        const nextDue = new Date();
        if (input.frequency === 'WEEKLY') nextDue.setDate(nextDue.getDate() + 7);
        else nextDue.setMonth(nextDue.getMonth() + 1);
        (data as any).nextDueDate = nextDue;
      }
    }
    if ((input as any).autoDeposit !== undefined) {
      (data as any).autoDeposit = (input as any).autoDeposit;
      if ((input as any).autoDeposit) {
        const freq = (input.frequency as string) || (existing as any).frequency;
        const nextDue = new Date();
        if (freq === 'WEEKLY') nextDue.setDate(nextDue.getDate() + 7);
        else nextDue.setMonth(nextDue.getMonth() + 1);
        (data as any).nextDueDate = nextDue;
      } else {
        (data as any).nextDueDate = null;
      }
    }
    if (input.sourceWalletId !== undefined) {
      data.sourceWallet = input.sourceWalletId
        ? { connect: { id: input.sourceWalletId } }
        : { disconnect: true };
    }
    if (input.destinationWalletId !== undefined) {
      data.destinationWallet = input.destinationWalletId
        ? { connect: { id: input.destinationWalletId } }
        : { disconnect: true };
    }

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
   * Goal contribution is internal transfer and does NOT create EXPENSE transaction.
   * Rejects any contribution that exceeds remaining goal target amount.
   */
  static async addGoalContribution(
    userId: string,
    goalId: string,
    input: CreateGoalContributionInput
  ) {
    const { sourceWalletId, amount, contributionDate } = input;
    const contributionAmount = new Prisma.Decimal(amount);

    if (contributionAmount.lte(0)) {
      throw new Error('Nominal setoran harus lebih besar dari 0');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Verify goal ownership
      const goal = await tx.goal.findFirst({
        where: { id: goalId, userId },
      });

      if (!goal) {
        throw new Error('Target impian tidak ditemukan atau bukan milik Anda');
      }

      // 2. Calculate remaining amount and check overfunding
      const remainingTarget = goal.targetAmount.minus(goal.currentAmount);

      if (contributionAmount.gt(remainingTarget)) {
        throw new Error('Contribution exceeds remaining goal amount');
      }

      // 3. Verify source wallet ownership
      const sourceWallet = await tx.wallet.findFirst({
        where: { id: sourceWalletId, userId },
      });

      if (!sourceWallet) {
        throw new Error('Dompet sumber tidak ditemukan atau bukan milik Anda');
      }

      // 4. Conditional decrement on wallet balance to prevent overdraft
      const updatedWalletCount = await tx.wallet.updateMany({
        where: {
          id: sourceWalletId,
          userId,
          balance: { gte: contributionAmount },
        },
        data: {
          balance: { decrement: contributionAmount },
        },
      });

      if (updatedWalletCount.count === 0) {
        throw new Error('Saldo dompet sumber tidak mencukupi untuk setoran target');
      }

      // 5. Conditional increment on goal currentAmount to prevent race condition overfunding
      const updatedGoalCount = await tx.goal.updateMany({
        where: {
          id: goalId,
          userId,
          currentAmount: { lte: goal.targetAmount.minus(contributionAmount) },
        },
        data: {
          currentAmount: { increment: contributionAmount },
        },
      });

      if (updatedGoalCount.count === 0) {
        throw new Error('Contribution exceeds remaining goal amount');
      }

      const txDate = contributionDate ? new Date(contributionDate) : new Date();

      // 6. Create GoalContribution record + advance nextDueDate if autoDeposit
      const contribution = await tx.goalContribution.create({
        data: {
          goalId,
          sourceWalletId,
          amount: contributionAmount,
          contributionDate: txDate,
        },
      });
      if ((goal as any).autoDeposit) {
        const nextDue = new Date(txDate);
        if ((goal as any).frequency === 'WEEKLY') nextDue.setDate(nextDue.getDate() + 7);
        else nextDue.setMonth(nextDue.getMonth() + 1);
        await tx.goal.update({ where: { id: goalId }, data: { nextDueDate: nextDue } });
      }

      const freshGoal = await tx.goal.findUniqueOrThrow({
        where: { id: goalId },
      });

      const freshWallet = await tx.wallet.findUniqueOrThrow({
        where: { id: sourceWalletId },
      });

      return {
        contribution,
        goal: {
          ...freshGoal,
          ...this.computeGoalMetrics(freshGoal),
        },
        wallet: freshWallet,
      };
    });
  }
}
