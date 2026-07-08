import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Article from '@/models/Article';
import User from '@/models/User';
import { articleUpdateSchema } from '@/lib/validations';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const article = await Article.findOne({ slug })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .populate('reviewer', 'name')
      .lean();

    if (!article) {
      return apiError('Article not found', 404);
    }

    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';
    const isAuthor = session?.user?.id === (article as any).author?._id?.toString();

    if (article.status !== 'published' && !isAdmin && !isAuthor) {
      return apiError('Article not found', 404);
    }

    if (article.status === 'published') {
      await Article.findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } });
    }

    return apiSuccess(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return apiError('Failed to fetch article', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    const body = await req.json();
    const parsed = articleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    await connectDB();

    const article = await Article.findOne({ slug });
    if (!article) {
      return apiError('Article not found', 404);
    }

    const isAdmin = session.user.role === 'admin';
    const isAuthor = session.user.id === article.author.toString();

    if (!isAdmin && !isAuthor) {
      return apiError('Unauthorized', 401);
    }

    if (!isAdmin && article.status === 'published') {
      return apiError('Cannot edit a published article');
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.blocks) {
      updateData.blocks = JSON.stringify(parsed.data.blocks);
    }
    for (const [key, val] of Object.entries(parsed.data)) {
      if (key !== 'blocks') {
        updateData[key] = val;
      }
    }

    if (updateData.title) {
      let newSlug = generateSlug(updateData.title as string);
      const existing = await Article.findOne({ slug: newSlug, _id: { $ne: article._id } });
      if (existing) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      updateData.slug = newSlug;
    }

    // Admin review actions
    if (isAdmin && parsed.data.status) {
      if (parsed.data.status === 'published') {
        updateData.publishedAt = article.publishedAt || new Date();
        updateData.reviewer = session.user.id;
      }
      if (parsed.data.status === 'draft' && article.status === 'review') {
        updateData.reviewer = session.user.id;
      }
    }

    if (!isAdmin) {
      delete updateData.status;
      // Reset to draft for re-review when editing a review-status article
      if (article.status === 'review') {
        updateData.status = 'draft';
      }
    }

    updateData.version = (article.version || 0) + 1;

    const updated = await Article.findOneAndUpdate({ slug }, { $set: updateData }, { new: true })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .populate('reviewer', 'name');

    return apiSuccess(updated, isAdmin && parsed.data.status ? `Article ${parsed.data.status}` : 'Article updated');
  } catch (error) {
    console.error('Error updating article:', error);
    return apiError('Failed to update article', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    await connectDB();

    const article = await Article.findOne({ slug });
    if (!article) {
      return apiError('Article not found', 404);
    }

    const isAdmin = session.user.role === 'admin';
    const isAuthor = session.user.id === article.author.toString();

    if (!isAdmin && !isAuthor) {
      return apiError('Unauthorized', 401);
    }

    if (!isAdmin && article.status !== 'draft' && article.status !== 'review') {
      return apiError('Cannot delete a published article');
    }

    await Article.deleteOne({ slug });
    return apiSuccess(null, 'Article deleted');
  } catch (error) {
    console.error('Error deleting article:', error);
    return apiError('Failed to delete article', 500);
  }
}
