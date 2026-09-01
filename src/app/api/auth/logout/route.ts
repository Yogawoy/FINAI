import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-response';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  return apiSuccess({ message: 'Berhasil keluar' });
}
