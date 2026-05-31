import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Question from '@/models/Question';
import Category from '@/models/Category';
import { apiSuccess, apiError } from '@/lib/utils';
import { z } from 'zod';

const updateQuestionSchema = z.object({
  questionText: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  options: z.array(z.string()).length(4).optional(),
  correctAnswer: z.number().int().min(0).max(3).optional(),
  explanation: z.string().min(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  source: z.string().min(1).optional(),
  sourceQuestionId: z.number().int().optional(),
  imageUrl: z.string().optional().or(z.literal('')),
  active: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;
    await connectDB();

    const question = await Question.findById(id)
      .populate('category', 'name slug')
      .lean();

    if (!question) {
      return apiError('Question not found', 404);
    }

    return apiSuccess(JSON.parse(JSON.stringify(question)));
  } catch (error) {
    console.error('Error fetching question:', error);
    return apiError('Failed to fetch question', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateQuestionSchema.safeParse(body);
    if (!result.success) {
      return apiError(result.error.issues[0].message);
    }

    await connectDB();

    const oldQuestion = await Question.findById(id);
    if (!oldQuestion) {
      return apiError('Question not found', 404);
    }

    if (result.data.category && result.data.category !== oldQuestion.category.toString()) {
      const categoryExists = await Category.findById(result.data.category);
      if (!categoryExists) {
        return apiError('Category not found');
      }
    }

    const question = await Question.findByIdAndUpdate(id, result.data, {
      new: true,
      runValidators: true,
    });

    if (result.data.category && result.data.category !== oldQuestion.category.toString()) {
      await Category.findByIdAndUpdate(oldQuestion.category, { $inc: { questionCount: -1 } });
      await Category.findByIdAndUpdate(result.data.category, { $inc: { questionCount: 1 } });
    }

    return apiSuccess(
      JSON.parse(JSON.stringify(question)),
      'Question updated successfully'
    );
  } catch (error) {
    console.error('Error updating question:', error);
    return apiError('Failed to update question', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;
    await connectDB();

    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return apiError('Question not found', 404);
    }

    await Category.findByIdAndUpdate(question.category, {
      $inc: { questionCount: -1 },
    });

    return apiSuccess(null, 'Question deleted successfully');
  } catch (error) {
    console.error('Error deleting question:', error);
    return apiError('Failed to delete question', 500);
  }
}
