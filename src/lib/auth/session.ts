import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

export const AUTH_COOKIE_NAME = 'finai_session';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export interface SafeUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export async function createSession(userId: string, rememberMe: boolean = true): Promise<string> {
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);

  // 30 days if rememberMe is true, else 7 days
  const durationDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  // Store in database
  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  // Set HTTP-only cookie if inside Next.js request store
  try {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
  } catch {
    // Outside Next.js request context (e.g. CLI unit testing environment)
  }

  return rawToken;
}

export async function getSessionTokenFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

export async function validateSessionToken(rawToken: string): Promise<SafeUser | null> {
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    // Delete expired session from DB
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    ...session.user,
    userId: session.user.id,
  };
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const token = await getSessionTokenFromCookie();
  if (!token) return null;
  return validateSessionToken(token);
}

export async function deleteSession(rawToken: string | null): Promise<void> {
  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
  }

  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
  } catch {}
}
