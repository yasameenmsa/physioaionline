import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Course from '@/models/Course';
import { CourseForm } from '@/components/features/courses/CourseForm';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function AdminEditCoursePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.courses' });

  await connectDB();

  const course = await Course.findOne({ slug }).lean();
  if (!course) notFound();

  const c = course as any;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('editTitle') || 'Edit Course'}</h2>
      <CourseForm
        initialData={{
          slug: c.slug,
          title: c.title,
          description: c.description || '',
          image: c.image || '',
          price: c.price || 0,
          category: c.category || '',
          level: c.level || 'beginner',
          tags: c.tags || [],
          whatYouLearn: c.whatYouLearn || [],
          requirements: c.requirements || [],
          published: c.published || false,
          sections: c.sections?.map((sec: any) => ({
            title: sec.title,
            order: sec.order,
            lessons: sec.lessons?.map((les: any) => ({
              title: les.title,
              videoId: les.videoId,
              videoUrl: les.videoUrl,
              duration: les.duration,
              order: les.order,
              isFree: les.isFree,
            })) || [],
          })) || [],
        }}
      />
    </div>
  );
}
