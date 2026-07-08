import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { apiError } from '@/lib/utils';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import User from '@/models/User';

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

    const progress = await Progress.findOne({
      userId: session.user.id,
      courseId: (course as any)._id,
    }).lean();

    if (!progress) {
      return apiError('Course not yet completed', 400);
    }

    const p = progress as any;
    const allLessons: string[] = [];
    for (const section of (course as any).sections || []) {
      for (const lesson of section.lessons || []) {
        allLessons.push(lesson.videoId);
      }
    }

    const completedArr = p.completedLessons || [];
    const allDone =
      allLessons.length > 0 &&
      allLessons.every((v: string) => completedArr.includes(v));

    if (!p.completedAt && !allDone) {
      return apiError('Course not yet completed', 400);
    }

    if (!p.completedAt && allDone) {
      await Progress.updateOne(
        { _id: p._id },
        { $set: { completedAt: new Date() } }
      );
      p.completedAt = new Date();
    }

    const user = await User.findById(session.user.id).lean();

    const userName =
      (user as any)?.name || session.user.name || session.user.email || 'Student';
    const courseTitle = (course as any).title;
    const completionDate = new Date(
      (progress as any).completedAt
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { generateCertificate } = await import('@/lib/certificate');
    const doc = generateCertificate(userName, courseTitle, completionDate);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${(course as any).slug}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return apiError('Failed to generate certificate', 500);
  }
}
