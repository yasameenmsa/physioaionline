import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';
import { escapeRegex } from '@/lib/escape-regex';
import { validate, schemas } from '@/lib/validations';
import Workshop from '@/models/Workshop';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const language = searchParams.get('language');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    await connectDB();

    const filter: Record<string, any> = { published: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (language) filter.language = language;
    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [workshops, total] = await Promise.all([
      Workshop.find(filter)
        .populate('instructor', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Workshop.countDocuments(filter),
    ]);

    const mapped = workshops.map((w: any) => ({
      ...w,
      lessonCount: w.sections?.reduce(
        (sum: number, s: any) => sum + (s.lessons?.length || 0),
        0
      ) || 0,
      blockCount: w.sections?.reduce(
        (sum: number, s: any) =>
          sum +
          (s.lessons?.reduce(
            (ls: number, l: any) => ls + (l.blocks?.length || 0),
            0
          ) || 0),
        0
      ) || 0,
      sectionCount: w.sections?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        workshops: mapped,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return apiError('Failed to fetch workshops', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return apiError('Unauthorized', 401);

    await connectDB();
    const body = await req.json();

    const validation = validate(schemas.workshopCreate, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;
    let slug = generateSlug(data.title);
    const existing = await Workshop.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const workshop = await Workshop.create({
      ...data,
      slug,
      instructor: session.user.id,
      sections: data.sections || [],
    });

    return apiSuccess(workshop, 'Workshop created successfully');
  } catch (error: any) {
    console.error('Error creating workshop:', error?.message || error);
    if (error?.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      const firstKey = Object.keys(error.errors)[0];
      const firstErr = error.errors[firstKey];
      return apiError(`${firstKey}: ${firstErr?.message || 'Validation failed'}`, 400);
    }
    return apiError(error?.message || 'Failed to create workshop', 500);
  }
}
