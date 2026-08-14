import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import { validate, schemas } from '@/lib/validations';
import Job from '@/models/Job';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const job = await Job.findOne({ slug, published: true })
      .populate('author', 'name')
      .lean();

    if (!job) return apiError('Job not found', 404);

    await Job.updateOne({ slug }, { $inc: { viewCount: 1 } });

    const mapped = {
      ...job,
      _id: job._id.toString(),
      author: (job as any).author
        ? { _id: (job as any).author._id?.toString(), name: (job as any).author.name }
        : null,
    };

    return apiSuccess(mapped);
  } catch (error) {
    console.error('Error fetching job:', error);
    return apiError('Failed to fetch job', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    await connectDB();
    const body = await req.json();

    const validation = validate(schemas.jobUpdate, body);
    if (!validation.success) {
      return apiError(validation.error, 400);
    }

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validation.data)) {
      if (value !== undefined) updates[key] = value;
    }

    const job = await Job.findOneAndUpdate({ slug }, updates, { new: true }).lean();

    if (!job) return apiError('Job not found', 404);

    return apiSuccess(job, 'Job updated successfully');
  } catch (error) {
    console.error('Error updating job:', error);
    return apiError('Failed to update job', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return apiError('Unauthorized', 401);
    }

    const { slug } = await params;
    await connectDB();

    const job = await Job.findOneAndDelete({ slug });

    if (!job) return apiError('Job not found', 404);

    return apiSuccess(null, 'Job deleted successfully');
  } catch (error) {
    console.error('Error deleting job:', error);
    return apiError('Failed to delete job', 500);
  }
}