import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { serializeWallet } from '@/lib/serializers/wallet';
import { WalletInUseError, WalletService } from '@/lib/services/wallet.service';
import { UpdateWalletSchema } from '@/lib/validations/wallet';

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
    const wallet = await WalletService.getWalletById(session.userId, id);

    if (!wallet) {
      return apiError('NOT_FOUND', 'Dompet tidak ditemukan', 404);
    }

    return apiSuccess({ wallet: serializeWallet(wallet) });
  } catch (error) {
    console.error('Get Wallet by ID Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat data dompet', 500);
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
    const result = UpdateWalletSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data pembaruan dompet tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const updated = await WalletService.updateWallet(session.userId, id, result.data);

    if (!updated) {
      return apiError('NOT_FOUND', 'Dompet tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ wallet: serializeWallet(updated) });
  } catch (error) {
    console.error('Update Wallet Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memperbarui dompet', 500);
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
    const deleted = await WalletService.deleteWallet(session.userId, id);

    if (!deleted) {
      return apiError('NOT_FOUND', 'Dompet tidak ditemukan atau bukan milik Anda', 404);
    }

    return apiSuccess({ message: 'Dompet berhasil dihapus' });
  } catch (error) {
    if (error instanceof WalletInUseError) {
      return apiError('WALLET_IN_USE', 'Wallet masih digunakan dan tidak dapat dihapus.', 409);
    }

    console.error('Delete Wallet Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal menghapus dompet', 500);
  }
}
