import { NextRequest } from 'next/server';
import { RegisterSchema } from '@/lib/validations/auth';
import { registerUser } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data pendaftaran tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const isMobile = request.headers.get('x-client-type')?.toLowerCase() === 'mobile';
    const response = await registerUser(result.data, { isMobile });

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
    console.error('Register API Error:', error);
    return apiError('INTERNAL_ERROR', 'Terjadi kesalahan sistem saat mendaftar', 500);
  }
}
