import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { LoginSchema } from '@/lib/validations/auth';
import { comparePassword, signToken, getCookieOptions } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data login tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return apiError('UNAUTHORIZED', 'Email atau kata sandi tidak cocok', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return apiError('UNAUTHORIZED', 'Email atau kata sandi tidak cocok', 401);
    }

    // Sign session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    const cookieOptions = getCookieOptions();
    cookieStore.set(cookieOptions.name, token, cookieOptions);

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      message: 'Berhasil masuk',
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return apiError('INTERNAL_ERROR', 'Terjadi kesalahan sistem saat masuk', 500);
  }
}
