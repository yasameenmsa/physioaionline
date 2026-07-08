import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Purchase from '@/models/Purchase';
import Progress from '@/models/Progress';
import { CourseViewClient } from './CourseViewClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseViewPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  await connectDB();

  const course = await Course.findOne({ slug })
    .populate('instructor', 'name image')
    .lean();

  if (!course) notFound();

  const c = course as any;

  if (!c.published) {
    const isInstructor =
      session?.user?.id === c.instructor?._id?.toString();
    const isAdmin = session?.user?.role === 'admin';
    if (!isInstructor && !isAdmin) notFound();
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

  let progressData = null;
  if (session?.user) {
    const progress = await Progress.findOne({
      userId: session.user.id,
      courseId: c._id,
    }).lean();
    if (progress) {
      const p = progress as any;
      const allLessons: string[] = [];
      for (const sec of c.sections || []) {
        for (const les of sec.lessons || []) {
          allLessons.push(les.videoId);
        }
      }
      const completed = p.completedLessons?.length || 0;
      const total = allLessons.length;
      const percentage =
        total > 0 ? Math.round((completed / total) * 100) : 0;
      progressData = {
        completedLessons: p.completedLessons || [],
        percentage,
        isComplete: percentage >= 100,
        lastVideoId: p.lastVideoId || '',
      };
    } else {
      progressData = {
        completedLessons: [],
        percentage: 0,
        isComplete: false,
        lastVideoId: '',
      };
    }
  }

  const serialized = {
    _id: c._id.toString(),
    slug: c.slug,
    title: c.title,
    description: c.description,
    image: c.image,
    price: c.price,
    category: c.category,
    level: c.level,
    tags: c.tags,
    whatYouLearn: c.whatYouLearn,
    requirements: c.requirements,
    published: c.published,
    instructor: c.instructor
      ? {
          _id: c.instructor._id.toString(),
          name: c.instructor.name,
        }
      : null,
    sections: (c.sections || []).map((sec: any) => ({
      _id: sec._id?.toString() || '',
      title: sec.title,
      order: sec.order,
      lessons: (sec.lessons || []).map((les: any) => ({
        _id: les._id?.toString() || '',
        title: les.title,
        videoId: les.videoId,
        videoUrl: les.videoUrl,
        duration: les.duration,
        order: les.order,
        isFree: les.isFree,
      })),
    })),
    createdAt: c.createdAt?.toISOString(),
    updatedAt: c.updatedAt?.toISOString(),
  };

  return (
    <CourseViewClient
      course={serialized}
      hasAccess={hasAccess}
      initialProgress={progressData}
      isAuthenticated={!!session?.user}
      isAdmin={session?.user?.role === 'admin'}
      currentUserId={session?.user?.id}
    />
  );
}
