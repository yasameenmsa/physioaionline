import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Question from '@/models/Question';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    const user = session?.user as { role?: string; tier?: string } | undefined;
    const isPremium = user?.role === 'admin' || user?.tier === 'premium' || user?.tier === 'pro';
    const isAuthenticated = !!session?.user;

    const visibleLimit = isPremium ? Infinity : isAuthenticated ? 5 : 2;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const filter: Record<string, unknown> = { active: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const [allQuestions, total] = await Promise.all([
      Question.find(filter)
        .populate('category', 'name slug')
        .select('-correctAnswer -explanation')
        .lean(),
      Question.countDocuments(filter),
    ]);

    const visiblePool = isPremium ? allQuestions : allQuestions.slice(0, visibleLimit);
    const visibleTotal = visiblePool.length;
    const totalPages = Math.ceil(visibleTotal / limit);
    const safePage = Math.min(page, Math.max(1, totalPages));
    const startIdx = (safePage - 1) * limit;
    const questions = visiblePool.slice(startIdx, startIdx + limit);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total: visibleTotal,
        actualTotal: total,
        page: safePage,
        totalPages,
        isLimited: !isPremium,
        visibleLimit,
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
