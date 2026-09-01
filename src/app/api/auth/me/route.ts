import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Sesi tidak valid atau telah berakhir', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        settings: true,
      },
    });

    if (!user) {
      return apiError('NOT_FOUND', 'Pengguna tidak ditemukan', 404);
    }

    return apiSuccess({ user });
  } catch (error) {
    console.error('Auth ME API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat data pengguna', 500);
  }
}
