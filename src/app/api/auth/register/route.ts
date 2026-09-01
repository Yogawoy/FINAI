import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { RegisterSchema } from '@/lib/validations/auth';
import { hashPassword, signToken, getCookieOptions } from '@/lib/auth';
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

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already registered
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return apiError('CONFLICT', 'Email sudah terdaftar. Silakan masuk.', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and auto-create default settings atomically
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        settings: {
          create: {
            language: 'id-ID',
            currency: 'IDR',
            numberFormat: 'id-ID',
            budgetReminder: true,
            goalReminder: true,
            financialSummary: true,
            aiPersonalization: true,
            aiActionConfirmation: true,
            animations: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

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

    return apiSuccess(
      {
        user,
        message: 'Pendaftaran akun berhasil',
      },
      201
    );
  } catch (error) {
    console.error('Register API Error:', error);
    return apiError('INTERNAL_ERROR', 'Terjadi kesalahan sistem saat mendaftar', 500);
  }
}
