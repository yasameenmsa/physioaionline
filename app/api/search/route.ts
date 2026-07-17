import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category';
import User from '@/models/User';
import { apiSuccess, apiError } from '@/lib/utils';
import { escapeRegex } from '@/lib/escape-regex';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'));

    if (!q || q.trim().length < 2) {
      return apiSuccess({ articles: [], categories: [] });
    }

    const [articles, categories] = await Promise.all([
      Article.find(
        { $text: { $search: q }, status: 'published' },
        { score: { $meta: 'textScore' } }
      )
        .populate('category', 'name slug')
        .populate('author', 'name')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean(),
      Category.find({
        name: { $regex: escapeRegex(q), $options: 'i' },
        active: true,
      })
        .limit(5)
        .lean(),
    ]);

    return apiSuccess({ articles, categories });
  } catch (error) {
    console.error('Search error:', error);
    return apiError('Search failed', 500);
  }
}
