import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    await connectDB();

    const filter: Record<string, any> = { published: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    const mapped = courses.map((c: any) => ({
      ...c,
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
      sectionCount: c.sections?.length || 0,
    }));

    return apiSuccess({
      courses: mapped,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return apiError('Failed to fetch courses', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    await connectDB();
    const body = await req.json();

    if (!body.title || !body.sections?.length) {
      return apiError('Title and at least one section are required', 400);
    }

    let slug = generateSlug(body.title);
    const existing = await Course.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const course = await Course.create({
      ...body,
      slug,
      instructor: session.user.id,
    });

    return apiSuccess(course, 'Course created successfully');
  } catch (error) {
    console.error('Error creating course:', error);
    return apiError('Failed to create course', 500);
  }
}
