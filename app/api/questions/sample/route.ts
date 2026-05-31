import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';
import '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Validate limit
    if (limit < 1 || limit > 10) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Fetch random sample questions
    const questions = await Question.aggregate([
      { $match: { active: true } },
      { $sample: { size: limit } },
    ]);

    await Question.populate(questions, { path: 'category', select: 'name' });

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching sample questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sample questions' },
      { status: 500 }
    );
  }
}
