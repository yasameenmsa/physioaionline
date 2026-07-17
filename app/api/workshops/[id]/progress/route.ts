import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import Workshop from '@/models/Workshop';
import WorkshopProgress from '@/models/WorkshopProgress';

function countAllLessons(lessons: any[]): number {
  return lessons.reduce((sum, l) => sum + 1 + (l.children ? countAllLessons(l.children) : 0), 0);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    await connectDB();

    const workshop = await Workshop.findOne({ slug: id }).lean();
    if (!workshop) return apiError('Workshop not found', 404);

    const progress = await WorkshopProgress.findOne({
      userId: session.user.id,
      workshopId: workshop._id,
    }).lean();

    const totalLessons = (workshop as any).sections?.reduce(
      (sum: number, s: any) => sum + countAllLessons(s.lessons || []),
      0
    ) || 0;

    return apiSuccess({
      completedLessons: progress?.completedLessons || [],
      completedAt: progress?.completedAt || null,
      lastLessonId: progress?.lastLessonId || '',
      totalLessons,
      percentage: totalLessons > 0
        ? Math.round(((progress?.completedLessons?.length || 0) / totalLessons) * 100)
        : 0,
    });
  } catch (error) {
    console.error('Error fetching workshop progress:', error);
    return apiError('Failed to fetch progress', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    const body = await req.json();
    const { lessonId } = body;

    if (!lessonId) return apiError('lessonId is required', 400);

    await connectDB();

    const workshop = await Workshop.findOne({ slug: id }).lean();
    if (!workshop) return apiError('Workshop not found', 404);

    let progress = await WorkshopProgress.findOne({
      userId: session.user.id,
      workshopId: workshop._id,
    });

    if (!progress) {
      progress = await WorkshopProgress.create({
        userId: session.user.id,
        workshopId: workshop._id,
        completedLessons: [lessonId],
        lastLessonId: lessonId,
      });
    } else {
      const isCompleted = progress.completedLessons.includes(lessonId);

      if (isCompleted) {
        progress.completedLessons = progress.completedLessons.filter(
          (id) => id !== lessonId
        );
      } else {
        progress.completedLessons.push(lessonId);
      }

      progress.lastLessonId = lessonId;

      const totalLessons = (workshop as any).sections?.reduce(
        (sum: number, s: any) => sum + countAllLessons(s.lessons || []),
        0
      ) || 0;

      if (
        totalLessons > 0 &&
        progress.completedLessons.length === totalLessons
      ) {
        progress.completedAt = new Date();
      } else {
        progress.completedAt = null;
      }

      await progress.save();
    }

    return apiSuccess({
      completedLessons: progress.completedLessons,
      completedAt: progress.completedAt,
      lastLessonId: progress.lastLessonId,
    });
  } catch (error) {
    console.error('Error updating workshop progress:', error);
    return apiError('Failed to update progress', 500);
  }
}
