import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';
import { hashToken, isTokenExpired } from '@/lib/tokens';
import { checkRateLimit } from '@/lib/rate-limiter';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return handleVerification(request);
}

export async function POST(request: NextRequest) {
  return handleVerification(request);
}

async function handleVerification(request: NextRequest) {
  try {
    await connectDB();

    // Get token from URL query params or request body
    const url = new URL(request.url);
    const token = url.searchParams.get('token') ||
      (request.method === 'POST' ? ((await request.json()) as { token?: string }).token : null);

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Rate limiting by IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    const rateLimitResult = checkRateLimit(ip, 'email-verification');
    if (!rateLimitResult.success) {
      return errorResponse(
        `Too many verification attempts. Please try again later.`,
        429
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with this verification token
    const user = await User.findOne({
      verificationToken: hashedToken,
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return errorResponse('Invalid or expired verification token', 400);
    }

    // Check if token is expired
    if (isTokenExpired(user.verificationTokenExpires)) {
      return errorResponse(
        'Verification token has expired. Please request a new one.',
        400
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return successResponse(
        { email: user.email, emailVerified: true },
        'Email already verified'
      );
    }

    // Verify the email
    await user.verifyEmail();

    return successResponse(
      { email: user.email, emailVerified: true },
      'Email verified successfully. You can now log in.'
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return errorResponse('Failed to verify email', 500);
  }
}
