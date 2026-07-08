import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { CourseForm } from '@/components/features/courses/CourseForm';

export default async function CreateCoursePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const t = await getTranslations('courses.create');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {t('title')}
        </h1>
        <CourseForm />
      </div>
    </div>
  );
}
