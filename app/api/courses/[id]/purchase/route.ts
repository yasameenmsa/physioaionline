import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import Course from '@/models/Course';
import Purchase from '@/models/Purchase';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    await connectDB();
    const course = await Course.findOne({ slug: id }).lean();
    if (!course) return apiError('Course not found', 404);

    const c = course as any;
    if (c.price === 0) {
      return apiError('This course is free', 400);
    }

    const existing = await Purchase.findOne({
      userId: session.user.id,
      courseId: c._id,
      status: 'completed',
    });
    if (existing) {
      return apiSuccess({ alreadyPurchased: true }, 'Already purchased');
    }

    await Purchase.create({
      userId: session.user.id,
      courseId: c._id,
      amount: c.price,
      status: 'completed',
      paidAt: new Date(),
    });

    return apiSuccess({ success: true }, 'Purchase recorded');
  } catch (error) {
    console.error('Error processing purchase:', error);
    return apiError('Failed to process purchase', 500);
  }
}
