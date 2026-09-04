import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { BudgetService } from '@/lib/services/budget.service';
import { serializeBudget } from '@/lib/serializers/budget';
import { UpdateBudgetSchema } from '@/lib/validations/budget';
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
    const budget = await BudgetService.getBudgetById(session.userId, id);

    if (!budget) {
      return apiError('NOT_FOUND', 'Pos anggaran tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ budget: serializeBudget(budget) });
  } catch (error) {
    console.error('Get Budget by ID Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat pos anggaran', 500);
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
    const result = UpdateBudgetSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data pembaruan anggaran tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const updated = await BudgetService.updateBudget(session.userId, id, result.data);

    if (!updated) {
      return apiError('NOT_FOUND', 'Pos anggaran tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ budget: serializeBudget(updated) });
  } catch (error) {
    console.error('Update Budget Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memperbarui anggaran', 500);
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
    const deleted = await BudgetService.deleteBudget(session.userId, id);

    if (!deleted) {
      return apiError('NOT_FOUND', 'Pos anggaran tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ message: 'Pos anggaran berhasil dihapus' });
  } catch (error) {
    console.error('Delete Budget Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal menghapus anggaran', 500);
  }
}
