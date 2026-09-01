import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { TransactionService } from '@/lib/services/transaction.service';
import { UpdateTransactionSchema } from '@/lib/validations/transaction';
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
    const transaction = await TransactionService.getTransactionById(session.userId, id);

    if (!transaction) {
      return apiError('NOT_FOUND', 'Transaksi tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ transaction });
  } catch (error) {
    console.error('Get Transaction by ID Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat data transaksi', 500);
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
    const result = UpdateTransactionSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data pembaruan transaksi tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const updated = await TransactionService.updateTransaction(
      session.userId,
      id,
      result.data
    );

    if (!updated) {
      return apiError('NOT_FOUND', 'Transaksi tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ transaction: updated });
  } catch (error: unknown) {
    console.error('Update Transaction Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal memperbarui transaksi';
    return apiError('INTERNAL_ERROR', message, 500);
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
    const deleted = await TransactionService.deleteTransaction(session.userId, id);

    if (!deleted) {
      return apiError('NOT_FOUND', 'Transaksi tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ message: 'Transaksi berhasil dihapus dan saldo dompet telah dipulihkan' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal menghapus transaksi', 500);
  }
}
