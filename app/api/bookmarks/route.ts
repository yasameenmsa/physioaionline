import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import SavedArticle from '@/models/SavedArticle';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    await connectDB();

    const bookmarks = await SavedArticle.find({ userId: session.user.id })
      .populate({
        path: 'articleId',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'author', select: 'name' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return apiError('Failed to fetch bookmarks', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const { articleId } = await req.json();
    if (!articleId) {
      return apiError('articleId is required');
    }

    await connectDB();

    const existing = await SavedArticle.findOne({
      userId: session.user.id,
      articleId,
    });

    if (existing) {
      return apiSuccess(existing, 'Already bookmarked');
    }

    const bookmark = await SavedArticle.create({
      userId: session.user.id,
      articleId,
    });

    return apiSuccess(bookmark, 'Article bookmarked');
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return apiError('Failed to save bookmark', 500);
  }
}
