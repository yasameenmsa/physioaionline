import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { checkRateLimit } from './rate-limiter';

class EmailNotVerified extends CredentialsSignin {
  code = 'email_not_verified';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          await connectDB();

          const User = (await import('@/models/User')).default;

          // Rate limiting by email
          const rateLimitResult = checkRateLimit(credentials.email as string, 'login');
          if (!rateLimitResult.success) {
            throw new Error('Too many login attempts. Please try again later.');
          }

          const user = await User.findOne({ email: credentials.email }).select(
            '+password +emailVerified +failedLoginAttempts +lockUntil'
          );

          if (!user) {
            // Don't reveal if email exists
            throw new Error('Invalid email or password');
          }

          // Check if account is locked due to failed login attempts
          if (user.isLocked()) {
            const lockMinutes = Math.ceil(
              (user.lockUntil!.getTime() - Date.now()) / 60000
            );
            throw new Error(
              `Account locked due to too many failed attempts. Please try again in ${lockMinutes} minutes.`
            );
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new EmailNotVerified();
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            // Record failed login attempt
            await user.recordFailedLogin();

            // Check if account is now locked
            if (user.isLocked()) {
              throw new Error(
                'Too many failed login attempts. Account has been locked for 15 minutes.'
              );
            }

            throw new Error('Invalid email or password');
          }

          // Reset failed login attempts on successful login
          await user.resetFailedLoginAttempts();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            tier: user.tier,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tier = user.tier;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tier = token.tier as string;
        (session.user as unknown as Record<string, unknown>).emailVerified = !!token.emailVerified;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function isPasswordStrong(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasLetter && hasNumber;
}
