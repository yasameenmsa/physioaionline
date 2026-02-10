import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { emailSchema } from '@/lib/validations';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { data, error } = await parseRequestBody(request, emailSchema);

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
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return errorResponse('Failed to send password reset email', 500);
    }

    return successResponse(
      {},
      'Password reset email sent. Please check your inbox.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse('Failed to process password reset request', 500);
  }
}
