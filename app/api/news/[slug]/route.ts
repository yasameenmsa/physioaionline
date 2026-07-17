import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { validate, schemas } from '@/lib/validations';
import News from '@/models/News';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const newsItem = await News.findOne({ slug, published: true })
      .populate('author', 'name')
      .lean();

    if (!newsItem) return apiError('News not found', 404);

    await News.updateOne({ slug }, { $inc: { viewCount: 1 } });

    const mapped = {
      ...newsItem,
      _id: newsItem._id.toString(),
      author: (newsItem as any).author
        ? { _id: (newsItem as any).author._id?.toString(), name: (newsItem as any).author.name }
        : null,
    };

    return apiSuccess(mapped);
  } catch (error) {
    console.error('Error fetching news:', error);
    return apiError('Failed to fetch news', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    await connectDB();
    const body = await req.json();

    const validation = validate(schemas.newsUpdate, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validation.data)) {
      if (value !== undefined) updates[key] = value;
    }
    if (updates.published) updates.publishedAt = new Date();

    const newsItem = await News.findOneAndUpdate({ slug }, updates, { new: true })
      .lean();

    if (!newsItem) return apiError('News not found', 404);

    return apiSuccess(newsItem, 'News updated successfully');
  } catch (error) {
    console.error('Error updating news:', error);
    return apiError('Failed to update news', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    await connectDB();

    const newsItem = await News.findOneAndDelete({ slug });

    if (!newsItem) return apiError('News not found', 404);

    return apiSuccess(null, 'News deleted successfully');
  } catch (error) {
    console.error('Error deleting news:', error);
    return apiError('Failed to delete news', 500);
  }
}
