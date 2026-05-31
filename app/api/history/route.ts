import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import ReadingHistory from '@/models/ReadingHistory';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    await connectDB();

    const history = await ReadingHistory.find({ userId: session.user.id })
      .populate({
        path: 'articleId',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'author', select: 'name' },
        ],
      })
      .sort({ readAt: -1 })
      .limit(50)
      .lean();

    return apiSuccess(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return apiError('Failed to fetch history', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiSuccess(null);
    }

    const { articleId } = await req.json();
    if (!articleId) {
      return apiError('articleId is required');
    }

    await connectDB();

    await ReadingHistory.findOneAndUpdate(
      { userId: session.user.id, articleId },
      { readAt: new Date() },
      { upsert: true, new: true }
    );

    return apiSuccess(null);
  } catch (error) {
    console.error('Error recording history:', error);
    return apiSuccess(null);
  }
}
