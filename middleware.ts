import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * NextAuth v5 middleware for route protection
 * Note: Using Node.js runtime because auth lib imports mongoose
 */
export const { auth: middleware } = auth;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  const isEmailVerified = req.auth?.user?.emailVerified ?? false;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ];

  // API routes that are public
  const publicApiRoutes = [
    '/api/auth/register',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ];

  // Check if current path is public
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    publicApiRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes require authentication
  if (!isAuthenticated) {
    const signInUrl = new URL('/login', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check email verification for authenticated users
  // Allow verified users to access protected routes
  // Unverified users can only access email verification related pages
  if (!isEmailVerified && pathname !== '/verify-email') {
    const verifyUrl = new URL('/verify-email', req.url);
    return NextResponse.redirect(verifyUrl);
  }

  return NextResponse.next();
});

/**
 * Configure middleware to run on specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints are public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
