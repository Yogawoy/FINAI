import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { WalletService } from '@/lib/services/wallet.service';
import { CreateWalletSchema } from '@/lib/validations/wallet';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const wallets = await WalletService.getWallets(session.userId);
    return apiSuccess({ wallets });
  } catch (error) {
    console.error('Get Wallets API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat daftar dompet', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = CreateWalletSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data dompet tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const wallet = await WalletService.createWallet(session.userId, result.data);
    return apiSuccess({ wallet }, 201);
  } catch (error) {
    console.error('Create Wallet API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal membuat dompet baru', 500);
  }
}
