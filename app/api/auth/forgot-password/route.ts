import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { forgotPasswordSchema } from '@/lib/validations';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limiter';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { data, error } = await parseRequestBody(request, forgotPasswordSchema);

    if (error) {
      return errorResponse(error, 400);
    }

    const { email } = data!;

    // Rate limiting by email
    const rateLimitResult = checkRateLimit(email, 'password-reset');
    if (!rateLimitResult.success) {
      return errorResponse(
        `Too many password reset requests. Please try again later.`,
        429
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success even if user doesn't exist (security - don't reveal if email exists)
    if (!user) {
      return successResponse(
        {},
        'If an account exists with this email, a password reset link has been sent.'
      );
    }

    // Generate reset token and send email
    const resetToken = await user.generateResetToken();
    await sendPasswordResetEmail(user.email, user.name || 'User', resetToken);

    return successResponse(
      {},
      'Password reset email sent. Please check your inbox.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Failed to process password reset request', 500);
  }
}
