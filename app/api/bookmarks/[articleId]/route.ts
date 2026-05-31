import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import SavedArticle from '@/models/SavedArticle';
import { apiSuccess, apiError } from '@/lib/utils';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const { articleId } = await params;
    await connectDB();

    await SavedArticle.deleteOne({
      userId: session.user.id,
      articleId,
    });

    return apiSuccess(null, 'Bookmark removed');
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return apiError('Failed to remove bookmark', 500);
  }
}
