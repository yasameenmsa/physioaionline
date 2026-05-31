import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Question from '@/models/Question';
import UserProgress from '@/models/UserProgress';
import User from '@/models/User';
import Category from '@/models/Category';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { questionId } = await params;

    const body = await request.json();
    const answer = body.answer;

    if (typeof answer !== 'number' || answer < 0 || answer > 3) {
      return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.canAnswerMore()) {
      return NextResponse.json({
        data: {
          correct: false,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          dailyLimitReached: true,
        },
      });
    }

    const isCorrect = answer === question.correctAnswer;

    let userProgress = await UserProgress.findOne({ userId: session.user.id });
    if (!userProgress) {
      userProgress = new UserProgress({ userId: session.user.id });
    }

    await userProgress.recordAnswer(question._id, question.category.toString(), isCorrect);

    await user.incrementDailyCount();

    const category = await Category.findById(question.category).select('name');

    return NextResponse.json({
      data: {
        correct: isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        categoryName: category?.name,
      },
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
