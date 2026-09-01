import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyToken } from '@/lib/auth/jwt';

// Routes requiring authentication
const PROTECTED_PAGE_PREFIX = '/app';
const PROTECTED_API_PREFIXES = [
  '/api/wallets',
  '/api/transactions',
  '/api/budgets',
  '/api/goals',
  '/api/settings',
  '/api/auth/me',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // 1. Check Protected API Routes
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedApi && !session) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Silakan masuk terlebih dahulu untuk mengakses layanan ini',
        },
      },
      { status: 401 }
    );
  }

  // 2. Check Protected Page Routes (/app/*)
  if (pathname.startsWith(PROTECTED_PAGE_PREFIX) && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If user is already authenticated and visits /login or /register, redirect to /app
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/app/:path*',
    '/api/wallets/:path*',
    '/api/transactions/:path*',
    '/api/budgets/:path*',
    '/api/goals/:path*',
    '/api/settings/:path*',
    '/api/auth/me',
    '/login',
    '/register',
  ],
};
