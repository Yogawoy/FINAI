import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UpdateProfileSchema } from '@/lib/validations/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError('UNAUTHORIZED', 'Sesi tidak valid atau telah berakhir', 401);
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error('Auth ME API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat data pengguna', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = UpdateProfileSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data profil tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: result.data.name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const safeUser = {
      ...updated,
      userId: updated.id,
    };

    return apiSuccess({ user: safeUser });
  } catch (error) {
    console.error('Update Profile API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memperbarui profil pengguna', 500);
  }
}
