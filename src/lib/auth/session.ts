import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, verifyToken, TokenPayload } from './jwt';

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  };
}
