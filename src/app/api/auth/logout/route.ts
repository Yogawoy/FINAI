import { logoutUser } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST() {
  try {
    const response = await logoutUser();
    return apiSuccess(response.data, response.statusCode);
  } catch (error) {
    console.error('Logout API Error:', error);
    return apiError('INTERNAL_ERROR', 'Terjadi kesalahan sistem saat keluar', 500);
  }
}
