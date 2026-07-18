import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { schemas } from '@/lib/validations';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils';
import { hashToken, isTokenExpired } from '@/lib/tokens';
import { hashPassword, isPasswordStrong } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { data, error } = await parseRequestBody(request, schemas.resetPassword);

    if (error) {
      return errorResponse(error, 400);
    }

    const { token, password } = data!;

    // Rate limiting by IP (reset-password endpoint)
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    const rateLimitResult = checkRateLimit(ip, 'password-reset');
    if (!rateLimitResult.success) {
      return errorResponse(
        `Too many password reset attempts. Please try again later.`,
        429
      );
    }

    // Validate password strength
    if (!isPasswordStrong(password)) {
      return errorResponse(
        'Password must be at least 8 characters and include both letters and numbers',
        400
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with this reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
    }).select('+resetPasswordToken +resetPasswordTokenExpires');

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Check if token is expired
    if (isTokenExpired(user.resetPasswordTokenExpires)) {
      return errorResponse(
        'Reset token has expired. Please request a new password reset.',
        400
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    return successResponse(
      {},
      'Password reset successfully. You can now log in with your new password.'
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return errorResponse('Failed to reset password', 500);
  }
}
