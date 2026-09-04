import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'finai_session';

// Protected page routes (/app and subroutes)
const PROTECTED_PAGE_PREFIX = '/app';

// Protected API routes
const PROTECTED_API_PREFIXES = [
  '/api/wallets',
  '/api/transactions',
  '/api/budgets',
  '/api/goals',
  '/api/settings',
  '/api/auth/me',
  '/api/transfers',
  '/api/ai',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionToken);

  // 1. Check Protected API Routes
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtectedApi && !isAuthenticated) {
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
  if (pathname.startsWith(PROTECTED_PAGE_PREFIX) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect authenticated user away from public auth routes (/login, /register) to /app
  if ((pathname === '/login' || pathname === '/register') && isAuthenticated) {
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
    '/api/settings',
    '/api/settings/:path*',
    '/api/auth/me',
    '/api/transfers',
    '/api/transfers/:path*',
    '/api/ai/:path*',
    '/login',
    '/register',
  ],
};
