import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const DAILY_LIMIT = 5;
    const remaining = user.canAnswerMore() ? Math.max(0, DAILY_LIMIT - user.dailyQuestionCount) : 0;

    return NextResponse.json({
      data: {
        remaining,
        limit: user.tier === 'free' ? DAILY_LIMIT : -1,
        tier: user.tier,
        isPremium: user.tier !== 'free',
      },
    });
  } catch (error) {
    console.error('Error fetching daily limit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily limit' },
      { status: 500 }
    );
  }
}
