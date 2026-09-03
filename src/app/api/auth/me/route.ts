import { getCurrentUser } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const response = await getCurrentUser();

    if (!response.success && response.error) {
      return apiError(
        response.error.code as any,
        response.error.message,
        response.statusCode
      );
    }

    return apiSuccess(response.data, response.statusCode);
  } catch (error) {
    console.error('Auth ME API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat data pengguna', 500);
  }
}
