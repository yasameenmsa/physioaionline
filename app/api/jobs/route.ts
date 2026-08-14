import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError, generateSlug } from '@/lib/utils';
import { escapeRegex } from '@/lib/escape-regex';
import { validate, schemas } from '@/lib/validations';
import Job from '@/models/Job';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { published: true };
    if (tag) filter.tags = { $in: [tag] };
    if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    const mapped = jobs.map((j) => ({
      ...j,
      _id: j._id.toString(),
      author: j.author
        ? { _id: (j.author as any)._id?.toString(), name: (j.author as any).name }
        : null,
    }));

    return apiSuccess({ jobs: mapped, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return apiError('Failed to fetch jobs', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return apiError('Unauthorized', 401);
    }
    const isAdmin = session.user.role === 'admin';

    await connectDB();
    const body = await req.json();

    const validation = validate(schemas.jobCreate, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;
    let slug = generateSlug(data.title);
    const existing = await Job.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const isPublished = isAdmin;

    const job = await Job.create({
      ...data,
      slug,
      author: session.user.id,
      published: isPublished,
      publishedAt: isPublished ? new Date() : undefined,
    });

    return apiSuccess(job, isPublished ? 'Job published' : 'Job submitted for review');
  } catch (error) {
    console.error('Error creating job:', error);
    return apiError('Failed to create job', 500);
  }
}
