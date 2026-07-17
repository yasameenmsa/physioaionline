import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';
import { escapeRegex } from '@/lib/escape-regex';
import { validate, schemas } from '@/lib/validations';
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
    if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };

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

    return NextResponse.json({
      success: true,
      data: { news: mapped, total, page, totalPages: Math.ceil(total / limit) },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return apiError('Failed to fetch news', 500);
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

    const validation = validate(schemas.newsCreate, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;
    let slug = generateSlug(data.title);
    const existing = await News.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const isPublished = isAdmin ? (data.published || false) : false;

    const newsItem = await News.create({
      ...data,
      slug,
      author: session.user.id,
      published: isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });

    return apiSuccess(newsItem, 'News created successfully');
  } catch (error) {
    console.error('Error creating news:', error);
    return apiError('Failed to create news', 500);
  }
}
