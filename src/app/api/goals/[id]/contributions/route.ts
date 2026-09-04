import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoalService } from '@/lib/services/goal.service';
import { serializeGoal } from '@/lib/serializers/goal';
import { serializeWallet } from '@/lib/serializers/wallet';
import { CreateGoalContributionSchema } from '@/lib/validations/goal';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const { id } = await props.params;
    const body = await request.json();
    const result = CreateGoalContributionSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data setoran tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const contributionResult = await GoalService.addGoalContribution(
      session.userId,
      id,
      result.data
    );

    return apiSuccess(
      {
        contribution: {
          id: contributionResult.contribution.id,
          goalId: contributionResult.contribution.goalId,
          sourceWalletId: contributionResult.contribution.sourceWalletId,
          amount: contributionResult.contribution.amount.toFixed(2),
          contributionDate: contributionResult.contribution.contributionDate.toISOString(),
          createdAt: contributionResult.contribution.createdAt.toISOString(),
        },
        goal: serializeGoal(contributionResult.goal),
        wallet: serializeWallet(contributionResult.wallet),
        message: 'Setoran target berhasil dicatat',
      },
      201
    );
  } catch (error: unknown) {
    console.error('Goal Contribution API Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses setoran target';
    const isNotFound = message.toLowerCase().includes('tidak ditemukan');
    const isBalanceError = message.toLowerCase().includes('saldo') && message.toLowerCase().includes('mencukupi');
    const isOverfunding = message.toLowerCase().includes('exceeds remaining goal amount');
    const isValidation = message.toLowerCase().includes('harus lebih besar dari 0');

    if (isNotFound) {
      return apiError('NOT_FOUND', message, 404);
    }

    if (isOverfunding) {
      return apiError('VALIDATION_ERROR', 'Setoran melebihi sisa target impian', 400);
    }

    if (isValidation) {
      return apiError('VALIDATION_ERROR', message, 400);
    }

    return apiError(
      isBalanceError ? 'INSUFFICIENT_BALANCE' : 'INTERNAL_ERROR',
      message,
      isBalanceError ? 409 : 500
    );
  }
}
