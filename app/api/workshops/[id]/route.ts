import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { validate, schemas } from '@/lib/validations';
import Workshop from '@/models/Workshop';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    await connectDB();

    const workshop = await Workshop.findOne({ slug: id })
      .populate('instructor', 'name image')
      .lean();

    if (!workshop) return apiError('Workshop not found', 404);

    const w = workshop as any;

    if (!w.published) {
      const isInstructor =
        session?.user?.id === w.instructor?._id?.toString();
      const isAdmin = session?.user?.role === 'admin';
      if (!isInstructor && !isAdmin) {
        return apiError('Workshop not found', 404);
      }
    }

    function countLessons(lessons: any[]): number {
      return lessons.reduce((sum, l) => sum + 1 + countLessons(l.children || []), 0);
    }
    function countBlocks(lessons: any[]): number {
      return lessons.reduce((sum, l) => sum + (l.blocks?.length || 0) + countBlocks(l.children || []), 0);
    }

    return apiSuccess({
      ...w,
      lessonCount: w.sections?.reduce(
        (sum: number, s: any) => sum + countLessons(s.lessons || []),
        0
      ) || 0,
      blockCount: w.sections?.reduce(
        (sum: number, s: any) => sum + countBlocks(s.lessons || []),
        0
      ) || 0,
    });
  } catch (error) {
    console.error('Error fetching workshop:', error);
    return apiError('Failed to fetch workshop', 500);
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
    const workshop = await Workshop.findOne({ slug: id });
    if (!workshop) return apiError('Workshop not found', 404);

    const isInstructor =
      workshop.instructor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isInstructor && !isAdmin) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();

    const validation = validate(schemas.workshopUpdate, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;
    const allowedFields: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) allowedFields[key] = value;
    }

    // Deep merge sections to preserve recursive children
    if (data.sections !== undefined) {
      workshop.sections = data.sections as any;
    }
    // Update whitelisted fields
    Object.keys(allowedFields).forEach((key) => {
      (workshop as any)[key] = allowedFields[key];
    });

    await workshop.save();

    return apiSuccess(workshop.toObject(), 'Workshop updated successfully');
  } catch (error) {
    console.error('Error updating workshop:', error);
    return apiError('Failed to update workshop', 500);
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
    const workshop = await Workshop.findOne({ slug: id });
    if (!workshop) return apiError('Workshop not found', 404);

    const isInstructor =
      workshop.instructor.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    if (!isInstructor && !isAdmin) {
      return apiError('Unauthorized', 401);
    }

    await Workshop.findByIdAndDelete(workshop._id);

    return apiSuccess(null, 'Workshop deleted successfully');
  } catch (error) {
    console.error('Error deleting workshop:', error);
    return apiError('Failed to delete workshop', 500);
  }
}
