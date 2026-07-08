import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Article from '@/models/Article';
import Category from '@/models/Category';
import User from '@/models/User';
import { articleSchema } from '@/lib/validations';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const author = searchParams.get('author');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const skip = (page - 1) * limit;

    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    const filter: Record<string, unknown> = {};

    if (category) {
      filter.category = category;
    }

    if (author) {
      filter.author = author;
      if (!isAdmin) {
        filter.$or = [{ status: 'published' }, { author: session?.user?.id }];
      }
    } else if (status && isAdmin) {
      filter.status = status;
    } else if (!isAdmin) {
      filter.status = 'published';
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name slug')
        .populate('author', 'name')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return apiSuccess({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return apiError('Failed to fetch articles', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const parsed = articleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    await connectDB();

    const category = await Category.findById(parsed.data.category);
    if (!category) {
      return apiError('Category not found');
    }

    let slug = generateSlug(parsed.data.title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const isAdmin = session.user.role === 'admin';
    const blocks = parsed.data.blocks;
    const article = await Article.create({
      ...parsed.data,
      blocks: blocks ? JSON.stringify(blocks) : undefined,
      slug,
      author: session.user.id,
      status: isAdmin ? 'published' : 'review',
      publishedAt: isAdmin ? new Date() : undefined,
      excerpt: parsed.data.excerpt || parsed.data.body.replace(/[#*`\n]/g, ' ').trim().slice(0, 200),
    });

    const populated = await Article.findById(article._id)
      .populate('category', 'name slug')
      .populate('author', 'name');

    return apiSuccess(populated, isAdmin ? 'Article published' : 'Article submitted for review');
  } catch (error) {
    console.error('Error creating article:', error);
    const message = error instanceof Error ? error.message : 'Failed to create article';
    return apiError(message, 500);
  }
}
