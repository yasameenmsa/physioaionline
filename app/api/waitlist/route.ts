import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import WaitlistEntry from '@/models/WaitlistEntry';
import { waitlistSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(ip, 'waitlist');

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = waitlistSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        {
          error: `${firstError.path.join('.')}: ${firstError.message}`,
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if email already exists
    const existingEntry = await WaitlistEntry.findOne({ email });
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Email already registered on waitlist' },
        { status: 409 }
      );
    }

    // Create new waitlist entry
    const entry = await WaitlistEntry.create({ email });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waitlist!',
        data: {
          email: entry.email,
          createdAt: entry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);

    // Handle duplicate key error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already registered on waitlist' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
