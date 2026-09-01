import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { SettingsService } from '@/lib/services/settings.service';
import { UpdateSettingsSchema } from '@/lib/validations/settings';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const settings = await SettingsService.getUserSettings(session.userId);
    return apiSuccess({ settings });
  } catch (error) {
    console.error('Get Settings API Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memuat pengaturan pengguna', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return apiError('UNAUTHORIZED', 'Silakan masuk terlebih dahulu', 401);
    }

    const body = await request.json();
    const result = UpdateSettingsSchema.safeParse(body);

    if (!result.success) {
      return apiError(
        'VALIDATION_ERROR',
        result.error.issues[0]?.message || 'Data pengaturan tidak valid',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const updated = await SettingsService.updateUserSettings(
      session.userId,
      result.data
    );

    return apiSuccess({ settings: updated });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return apiError('INTERNAL_ERROR', 'Gagal memperbarui pengaturan', 500);
  }
}
