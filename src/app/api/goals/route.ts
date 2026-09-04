import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoalService } from '@/lib/services/goal.service';
import { serializeGoal, serializeGoals } from '@/lib/serializers/goal';
import { CreateGoalSchema } from '@/lib/validations/goal';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const goals = await GoalService.getGoals(session.userId);
    return apiSuccess({ goals: serializeGoals(goals) });
  } catch (error) {
    console.error('Get Goals API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat target impian', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = CreateGoalSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data target tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const goal = await GoalService.createGoal(session.userId, result.data);
    return apiSuccess({ goal: serializeGoal(goal) }, 201);
  } catch (error) {
    console.error('Create Goal API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal membuat target baru', 500);
  }
}
