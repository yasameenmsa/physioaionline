import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    const filter: Record<string, unknown> = { active: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('category', 'name slug')
        .select('-correctAnswer -explanation')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
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
