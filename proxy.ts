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

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPrefixes.some((p) => pathname.startsWith(p))) {
    if (pathname.startsWith('/api')) return NextResponse.next();
    return intlMiddleware(req) ?? NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    const response = NextResponse.next();
    return intlMiddleware(req) ?? response;
  }

  if (/\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // If intlMiddleware didn't handle it but path has a locale prefix (/en/, /ar/),
  // treat it as a public content request (courses, news, articles etc.)
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
