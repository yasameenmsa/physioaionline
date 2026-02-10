import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { emailSchema } from '@/lib/validations';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limiter';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { data, error } = await parseRequestBody(request, emailSchema);

    if (error) {
      return errorResponse(error, 400);
    }

    const { email } = data!;

    // Rate limiting by email
    const rateLimitResult = checkRateLimit(email, 'resend-verification');
    if (!rateLimitResult.success) {
      return errorResponse(
        `Too many verification email requests. Please try again later.`,
        429
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success even if user doesn't exist (security)
    if (!user) {
      return successResponse(
        {},
        'If an account exists with this email, a verification link has been sent.'
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return successResponse(
        {},
        'This email is already verified. You can log in.'
      );
    }

    // Generate new verification token and send email
    const verificationToken = await user.generateVerificationToken();
    const emailResult = await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return errorResponse('Failed to send verification email', 500);
    }

    return successResponse(
      {},
      'Verification email sent. Please check your inbox.'
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return errorResponse('Failed to resend verification email', 500);
  }
}
