import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  TransferInsufficientBalanceError,
  TransferNotFoundError,
  TransferService,
  TransferValidationError,
} from '@/lib/services/transfer.service';
import { serializeWallet } from '@/lib/serializers/wallet';
import { TransferWalletSchema } from '@/lib/validations/wallet';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = TransferWalletSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data transfer tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const transferResult = await TransferService.transferBetweenWallets(
      session.userId,
      result.data
    );

    return apiSuccess(
      {
        fromWallet: serializeWallet(transferResult.fromWallet),
        toWallet: serializeWallet(transferResult.toWallet),
        message: 'Transfer saldo berhasil dilakukan',
      },
      200
    );
  } catch (error: unknown) {
    if (error instanceof TransferValidationError) {
      return apiError('VALIDATION_ERROR', error.message, 400);
    }

    if (error instanceof TransferNotFoundError) {
      return apiError('NOT_FOUND', error.message, 404);
    }

    if (error instanceof TransferInsufficientBalanceError) {
      return apiError('INSUFFICIENT_BALANCE', error.message, 409);
    }

    console.error('Transfer API Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal melakukan transfer saldo';
    return apiError('INTERNAL_ERROR', message, 500);
  }
}
