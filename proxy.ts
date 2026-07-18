import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

const publicPrefixes = [
  '/api',
  '/articles',
  '/questions',
  '/courses',
  '/news',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
];

function applySecurityHeaders(res: NextResponse) {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ')
  );
  return res;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    if (pathname.startsWith('/api')) {
      return applySecurityHeaders(NextResponse.next());
    }
    return intlMiddleware(req) ?? NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    return intlMiddleware(req) ?? NextResponse.next();
  }

  if (/\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  const localeMatch = pathname.match(/^\/(en|ar)(\/|$)/);
  if (localeMatch) {
    const remaining = pathname.slice(localeMatch[0].length - 1) || '/';
    if (
      publicPrefixes.some((p) => remaining.startsWith(p)) ||
      publicRoutes.includes(remaining)
    ) {
      return NextResponse.next();
    }
  }

  const token =
    req.cookies.get('authjs.session-token')?.value ??
    req.cookies.get('__Secure-authjs.session-token')?.value;

  if (!token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
