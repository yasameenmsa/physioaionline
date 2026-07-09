import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';
import News from '@/models/News';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { published: true };
    if (tag) filter.tags = { $in: [tag] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [news, total] = await Promise.all([
      News.find(filter)
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments(filter),
    ]);

    const mapped = news.map((n) => ({
      ...n,
      _id: n._id.toString(),
      author: n.author
        ? { _id: (n.author as any)._id?.toString(), name: (n.author as any).name }
        : null,
    }));

    return apiSuccess({ news: mapped, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return apiError(error.message || 'Failed to fetch news', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }
    const isAdmin = session.user.role === 'admin';

    await connectDB();
    const body = await req.json();
    const { title, titleAr, content, contentAr, excerpt, excerptAr, imageUrl, tags, published } = body;

    if (!title || !content) {
      return apiError('Title and content are required', 400);
    }

    let slug = generateSlug(title);
    const existing = await News.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const isPublished = isAdmin ? (published || false) : false;

    const newsItem = await News.create({
      title,
      titleAr: titleAr || '',
      slug,
      content,
      contentAr: contentAr || '',
      excerpt: excerpt || title.slice(0, 200),
      excerptAr: excerptAr || '',
      imageUrl: imageUrl || '',
      author: session.user.id,
      published: isPublished,
      tags: tags || [],
      publishedAt: isPublished ? new Date() : undefined,
    });

    return apiSuccess(newsItem, 'News created successfully');
  } catch (error: any) {
    return apiError(error.message || 'Failed to create news', 500);
  }
}
