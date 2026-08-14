import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/utils';
import Job from '@/models/Job';

export async function POST(
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

    const job = await Job.findOne({ slug });
    if (!job) {
      return apiError('Job not found', 404);
    }

    const newPublishedState = !job.published;

    job.published = newPublishedState;
    if (newPublishedState && !job.publishedAt) {
      job.publishedAt = new Date();
    }

    await job.save();

    return apiSuccess({ published: newPublishedState }, `Job ${newPublishedState ? 'published' : 'unpublished'}`);
  } catch (error) {
    console.error('Error publishing job:', error);
    return apiError('Failed to publish job', 500);
  }
}
