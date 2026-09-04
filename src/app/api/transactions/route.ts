import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { serializeTransaction, serializeTransactions } from '@/lib/serializers/transaction';
import { serializeWallet } from '@/lib/serializers/wallet';
import {
  InsufficientBalanceError,
  TransactionService,
  WalletNotFoundError,
} from '@/lib/services/transaction.service';
import { CreateTransactionSchema, TransactionTypeEnum } from '@/lib/validations/transaction';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId') || undefined;
    const typeParam = searchParams.get('type');
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;

    const typeResult = typeParam
      ? TransactionTypeEnum.safeParse(typeParam)
      : { success: true as const, data: undefined };

    if (!typeResult.success) {
      return apiError(
        'VALIDATION_ERROR',
        typeResult.error.issues[0]?.message || 'Tipe transaksi tidak valid',
        400
      );
    }

    if (!Number.isFinite(limit) || limit < 0 || !Number.isInteger(limit)) {
      return apiError('VALIDATION_ERROR', 'Parameter limit tidak valid', 400);
    }

    if (!Number.isFinite(offset) || offset < 0 || !Number.isInteger(offset)) {
      return apiError('VALIDATION_ERROR', 'Parameter offset tidak valid', 400);
    }

    const data = await TransactionService.getTransactions(session.userId, {
      walletId,
      type: typeResult.data,
      category,
      startDate,
      endDate,
      limit,
      offset,
    });

    return apiSuccess({
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      transactions: serializeTransactions(data.transactions),
    });
  } catch (error) {
    if (error instanceof WalletNotFoundError) {
      return apiError('NOT_FOUND', error.message, 404);
    }

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

    return apiSuccess(
      {
        transaction: serializeTransaction(transactionResult.transaction),
        wallet: serializeWallet(transactionResult.wallet),
      },
      201
    );
  } catch (error: unknown) {
    if (error instanceof WalletNotFoundError) {
      return apiError('NOT_FOUND', error.message, 404);
    }

    if (error instanceof InsufficientBalanceError) {
      return apiError('INSUFFICIENT_BALANCE', error.message, 409);
    }

    console.error('Create Transaction API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal mencatat transaksi', 500);
  }
}
