import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import UserProgress from '@/models/UserProgress';
import Category from '@/models/Category';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let userProgress = await UserProgress.findOne({ userId: session.user.id });

    if (!userProgress) {
      return NextResponse.json({
        data: {
          totalAnswered: 0,
          correctAnswers: 0,
          accuracy: 0,
          categoryStats: [],
          currentStreak: 0,
          longestStreak: 0,
          studyDays: [],
          lastPracticeDate: null,
        },
      });
    }

    const totalAnswered = userProgress.questionsAnswered.length;
    const accuracy = totalAnswered > 0
      ? Math.round((userProgress.correctAnswers / totalAnswered) * 100)
      : 0;

    const categoryIds = [...userProgress.categoryStats.keys()];
    const categories = await Category.find({ _id: { $in: categoryIds } })
      .select('name')
      .lean();
    const categoryMap = new Map(categories.map((c: any) => [c._id.toString(), c.name]));

    const categoryStats = [];
    for (const [key, value] of userProgress.categoryStats) {
      const stats = value as unknown as { total: number; correct: number };
      categoryStats.push({
        categoryId: key,
        categoryName: categoryMap.get(key) || 'Unknown',
        total: stats.total,
        correct: stats.correct,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      });
    }

    categoryStats.sort((a, b) => b.total - a.total);

    return NextResponse.json({
      data: {
        totalAnswered,
        correctAnswers: userProgress.correctAnswers,
        accuracy,
        categoryStats,
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
        studyDays: userProgress.studyDays,
        lastPracticeDate: userProgress.lastPracticeDate,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
