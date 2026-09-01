import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { TransferService } from '@/lib/services/transfer.service';
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
        ...transferResult,
        message: 'Transfer saldo berhasil dilakukan',
      },
      200
    );
  } catch (error: unknown) {
    console.error('Transfer API Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal melakukan transfer saldo';
    const isBalanceError = message.toLowerCase().includes('saldo tidak mencukupi');
    return apiError(
      isBalanceError ? 'INSUFFICIENT_BALANCE' : 'INTERNAL_ERROR',
      message,
      isBalanceError ? 400 : 500
    );
  }
}
