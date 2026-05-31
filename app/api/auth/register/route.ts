import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, isPasswordStrong } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rate-limiter';
import { headers } from 'next/headers';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { data, error } = await parseRequestBody(request, registerSchema);

    if (error) {
      return errorResponse(error, 400);
    }

    const { name, email, password } = data!;

    // Rate limiting by IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    const rateLimitResult = checkRateLimit(ip, 'registration');
    if (!rateLimitResult.success) {
      return errorResponse(
        `Too many registration attempts. Please try again later.`,
        429
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (existingUser) {
      if (existingUser.emailVerified) {
        return errorResponse('A user with this email already exists', 409);
      }
      // Unverified user — resend verification with updated info
      if (name) existingUser.name = name;
      const hashedPassword = await hashPassword(password);
      existingUser.password = hashedPassword;
      const verificationToken = await existingUser.generateVerificationToken();
      await sendVerificationEmail(existingUser.email, existingUser.name || 'User', verificationToken);
      return successResponse(
        { user: { id: existingUser._id.toString(), email: existingUser.email } },
        'A verification email has been sent to your email address.'
      );
    }

    // Validate password strength
    if (!isPasswordStrong(password)) {
      return errorResponse(
        'Password must be at least 8 characters and include both letters and numbers',
        400
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with unverified status
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      tier: 'free',
      dailyQuestionCount: 0,
      lastResetDate: new Date(),
      emailVerified: false,
    });

    // Generate verification token and send email
    const verificationToken = await user.generateVerificationToken();
    await sendVerificationEmail(user.email, user.name || 'User', verificationToken);

    return successResponse(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          tier: user.tier,
          emailVerified: false,
        },
      },
      'Account created successfully. Please check your email to verify your account.'
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
