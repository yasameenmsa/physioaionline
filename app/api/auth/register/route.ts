import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, isPasswordStrong } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, parseRequestBody } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limiter';
import { headers } from 'next/headers';

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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('A user with this email already exists', 409);
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
    const emailResult = await sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email fails, but log it
    }

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
