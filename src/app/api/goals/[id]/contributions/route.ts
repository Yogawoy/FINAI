import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoalService } from '@/lib/services/goal.service';
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
        ...contributionResult,
        message: 'Setoran target berhasil dicatat',
      },
      201
    );
  } catch (error: unknown) {
    console.error('Goal Contribution API Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memproses setoran target';
    const isBalanceError = message.toLowerCase().includes('saldo tidak mencukupi');
    return apiError(
      isBalanceError ? 'INSUFFICIENT_BALANCE' : 'INTERNAL_ERROR',
      message,
      isBalanceError ? 400 : 500
    );
  }
}
