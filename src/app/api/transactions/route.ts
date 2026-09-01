import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { TransactionService } from '@/lib/services/transaction.service';
import { CreateTransactionSchema } from '@/lib/validations/transaction';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId') || undefined;
    const type = (searchParams.get('type') as 'INCOME' | 'EXPENSE') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;

    const data = await TransactionService.getTransactions(session.userId, {
      walletId,
      type,
      category,
      startDate,
      endDate,
      limit,
      offset,
    });

    return apiSuccess(data);
  } catch (error) {
    console.error('Get Transactions API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat daftar transaksi', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = CreateTransactionSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data transaksi tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const transactionResult = await TransactionService.createTransaction(
      session.userId,
      result.data
    );

    return apiSuccess(transactionResult, 201);
  } catch (error: unknown) {
    console.error('Create Transaction API Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal mencatat transaksi';
    const isBalanceError = message.toLowerCase().includes('saldo') || message.toLowerCase().includes('mencukupi');
    return apiError(
      isBalanceError ? 'INSUFFICIENT_BALANCE' : 'INTERNAL_ERROR',
      message,
      isBalanceError ? 400 : 500
    );
  }
}
