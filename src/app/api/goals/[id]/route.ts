import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { GoalService } from '@/lib/services/goal.service';
import { serializeGoal } from '@/lib/serializers/goal';
import { UpdateGoalSchema } from '@/lib/validations/goal';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const { id } = await props.params;
    const goal = await GoalService.getGoalById(session.userId, id);

    if (!goal) {
      return apiError('NOT_FOUND', 'Target tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ goal: serializeGoal(goal) });
  } catch (error) {
    console.error('Get Goal by ID Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat detail target', 500);
  }
}

export async function PATCH(
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
    const result = UpdateGoalSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data pembaruan target tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const updated = await GoalService.updateGoal(session.userId, id, result.data);

    if (!updated) {
      return apiError('NOT_FOUND', 'Target tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ goal: serializeGoal(updated) });
  } catch (error) {
    console.error('Update Goal Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memperbarui target', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const { id } = await props.params;
    const deleted = await GoalService.deleteGoal(session.userId, id);

    if (!deleted) {
      return apiError('NOT_FOUND', 'Target tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ message: 'Target berhasil dihapus' });
  } catch (error) {
    console.error('Delete Goal Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal menghapus target', 500);
  }
}
