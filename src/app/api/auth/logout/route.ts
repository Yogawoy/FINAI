import { NextRequest } from 'next/server';
import { logoutUser } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    const response = await logoutUser(bearerToken);
    return apiSuccess(response.data, response.statusCode);
  } catch (error) {
    console.error('Logout API Error:', error);
    return apiError('INTERNAL_ERROR', 'Terjadi kesalahan sistem saat keluar', 500);
  }
}
