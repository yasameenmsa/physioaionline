import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Article from '@/models/Article';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/lib/utils';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    const body = await req.json();
    const { status, feedback } = body;

    if (!['published', 'draft', 'archived'].includes(status)) {
      return apiError('Invalid status');
    }

    await connectDB();

    const update: Record<string, unknown> = {
      status,
      reviewer: session.user.id,
      version: await Article.findOne({ slug }).then((a) => (a?.version ?? 0) + 1),
    };

    if (status === 'published') {
      update.publishedAt = new Date();
    }

    const article = await Article.findOneAndUpdate({ slug }, { $set: update }, { new: true })
      .populate('category', 'name slug')
      .populate('author', 'name');

    if (!article) {
      return apiError('Article not found', 404);
    }

    return apiSuccess(article, `Article ${status}`);
  } catch (error) {
    console.error('Error reviewing article:', error);
    return apiError('Failed to review article', 500);
  }
}
