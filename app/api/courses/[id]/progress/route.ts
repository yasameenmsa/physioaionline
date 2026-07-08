import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import Progress from '@/models/Progress';
import Course from '@/models/Course';

export async function GET(
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

    let progress = await Progress.findOne({
      userId: session.user.id,
      courseId: course._id,
    }).lean();

    if (!progress) {
      await Progress.create({
        userId: session.user.id,
        courseId: course._id,
        completedLessons: [],
        lastVideoId: '',
      });
      progress = await Progress.findOne({
        userId: session.user.id,
        courseId: course._id,
      }).lean();
    }

    const allLessons: string[] = [];
    for (const section of (course as any).sections || []) {
      for (const lesson of section.lessons || []) {
        allLessons.push(lesson.videoId);
      }
    }

    const completed = (progress as any)?.completedLessons?.length || 0;
    const total = allLessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return apiSuccess({
      progress,
      percentage,
      completedLessons: completed,
      totalLessons: total,
      isComplete: percentage >= 100,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
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

    await connectDB();
    const { videoId, completed } = await req.json();
    if (!videoId) return apiError('videoId is required', 400);

    const course = await Course.findOne({ slug: id }).lean();
    if (!course) return apiError('Course not found', 404);

    let progress = await Progress.findOne({
      userId: session.user.id,
      courseId: course._id,
    });

    if (!progress) {
      progress = await Progress.create({
        userId: session.user.id,
        courseId: course._id,
        completedLessons: [],
        lastVideoId: videoId,
      }) as any;
    }

    const p = progress as any;
    const set = new Set(p.completedLessons || []);

    if (completed) {
      set.add(videoId);
    } else {
      set.delete(videoId);
    }

    const completedArr = Array.from(set) as string[];

    const allLessons: string[] = [];
    for (const section of (course as any).sections || []) {
      for (const lesson of section.lessons || []) {
        allLessons.push(lesson.videoId);
      }
    }

    const isComplete =
      allLessons.length > 0 &&
      allLessons.every((v) => completedArr.includes(v));

    p.completedLessons = completedArr;
    p.lastVideoId = videoId;
    p.completedAt = isComplete ? new Date() : null;
    await p.save();

    const completedCount = completedArr.length;
    const total = allLessons.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return apiSuccess({
      completedLessons: completedArr,
      percentage,
      isComplete,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return apiError('Failed to update progress', 500);
  }
}
