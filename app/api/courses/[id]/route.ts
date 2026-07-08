import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import Course from '@/models/Course';
import Purchase from '@/models/Purchase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    await connectDB();

    const course = await Course.findOne({ slug: id })
      .populate('instructor', 'name image')
      .lean();

    if (!course) return apiError('Course not found', 404);

    const c = course as any;

    if (!c.published) {
      const isInstructor =
        session?.user?.id === c.instructor?._id?.toString();
      const isAdmin = session?.user?.role === 'admin';
      if (!isInstructor && !isAdmin) {
        return apiError('Course not found', 404);
      }
    }

    let hasAccess = false;
    if (c.price === 0) {
      hasAccess = true;
    } else if (session?.user) {
      const purchase = await Purchase.findOne({
        userId: session.user.id,
        courseId: c._id,
        status: 'completed',
      });
      hasAccess = !!purchase;
    }

    return apiSuccess({
      ...c,
      hasAccess,
      lessonCount: c.sections?.reduce(
        (sum: number, s: any) => sum + (s.lessons?.length || 0),
        0
      ) || 0,
      totalDuration: c.sections?.reduce(
        (sum: number, s: any) =>
          sum +
          (s.lessons?.reduce(
            (ls: number, l: any) => ls + (l.duration || 0),
            0
          ) || 0),
        0
      ) || 0,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return apiError('Failed to fetch course', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    await connectDB();
    const course = await Course.findOne({ slug: id });
    if (!course) return apiError('Course not found', 404);

    const isInstructor =
      course.instructor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isInstructor && !isAdmin) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const updated = await Course.findByIdAndUpdate(course._id, body, {
      new: true,
    });

    return apiSuccess(updated, 'Course updated successfully');
  } catch (error) {
    console.error('Error updating course:', error);
    return apiError('Failed to update course', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    await connectDB();
    const course = await Course.findOne({ slug: id });
    if (!course) return apiError('Course not found', 404);

    const isInstructor =
      course.instructor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isInstructor && !isAdmin) {
      return apiError('Unauthorized', 401);
    }

    await Course.findByIdAndDelete(course._id);

    return apiSuccess(null, 'Course deleted successfully');
  } catch (error) {
    console.error('Error deleting course:', error);
    return apiError('Failed to delete course', 500);
  }
}
