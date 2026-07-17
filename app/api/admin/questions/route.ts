import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Question from '@/models/Question';
import Category from '@/models/Category';
import { apiSuccess, apiError } from '@/lib/utils';
import { escapeRegex } from '@/lib/escape-regex';
import { z } from 'zod';

const createQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  category: z.string().min(1, 'Category is required'),
  options: z.array(z.string()).length(4, 'Must have exactly 4 options'),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(1, 'Explanation is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  source: z.string().min(1, 'Source is required'),
  sourceQuestionId: z.number().int().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  active: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')));
    const skip = (page - 1) * limit;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (active === 'true') filter.active = true;
    if (active === 'false') filter.active = false;
    if (search) {
      const escaped = escapeRegex(search);
      filter.$or = [
        { questionText: { $regex: escaped, $options: 'i' } },
        { source: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter),
    ]);

    return apiSuccess({
      questions: JSON.parse(JSON.stringify(questions)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return apiError('Failed to fetch questions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const result = createQuestionSchema.safeParse(body);
    if (!result.success) {
      return apiError(result.error.issues[0].message);
    }

    await connectDB();

    const categoryExists = await Category.findById(result.data.category);
    if (!categoryExists) {
      return apiError('Category not found');
    }

    const question = await Question.create(result.data);

    await Category.findByIdAndUpdate(result.data.category, {
      $inc: { questionCount: 1 },
    });

    return apiSuccess(
      JSON.parse(JSON.stringify(question)),
      'Question created successfully'
    );
  } catch (error) {
    console.error('Error creating question:', error);
    return apiError('Failed to create question', 500);
  }
}
