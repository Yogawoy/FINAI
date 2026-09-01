import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { BudgetService } from '@/lib/services/budget.service';
import { CreateBudgetSchema } from '@/lib/validations/budget';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') ? Number(searchParams.get('month')) : undefined;
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;

    const budgets = await BudgetService.getBudgets(session.userId, month, year);
    return apiSuccess({ budgets });
  } catch (error) {
    console.error('Get Budgets API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat pos anggaran', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = CreateBudgetSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data anggaran tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const budget = await BudgetService.createBudget(session.userId, result.data);
    return apiSuccess({ budget }, 201);
  } catch (error: unknown) {
    console.error('Create Budget API Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal membuat pos anggaran';
    const isConflict = message.includes('sudah dibuat');
    return apiError(isConflict ? 'CONFLICT' : 'INTERNAL_ERROR', message, isConflict ? 409 : 500);
  }
}
