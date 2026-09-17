import { NextRequest } from 'next/server';
import { LoginSchema } from '@/lib/validations/auth';
import { loginUser } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data masuk tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const isMobile = request.headers.get('x-client-type')?.toLowerCase() === 'mobile';
    const response = await loginUser(result.data, { isMobile });

    if (!response.success && response.error) {
      return apiError(
        response.error.code as any,
        response.error.message,
        response.statusCode,
        response.error.details
      );
    }

    return apiSuccess(response.data, response.statusCode);
  } catch (error) {
    console.error('Login API Error:', error);
    return apiError('INTERNAL_ERROR', 'Terjadi kesalahan sistem saat masuk', 500);
  }
}
