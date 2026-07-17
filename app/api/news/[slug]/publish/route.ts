import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import News from '@/models/News';

export async function POST(
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

    const newsItem = await News.findOne({ slug });
    if (!newsItem) {
      return apiError('News not found', 404);
    }

    // Toggle the published state
    const newPublishedState = !newsItem.published;
    
    newsItem.published = newPublishedState;
    if (newPublishedState && !newsItem.publishedAt) {
      newsItem.publishedAt = new Date();
    }
    
    await newsItem.save();

    return apiSuccess({ published: newPublishedState }, `News item ${newPublishedState ? 'published' : 'unpublished'}`);
  } catch (error) {
    console.error('Error publishing news:', error);
    return apiError('Failed to publish news', 500);
  }
}
