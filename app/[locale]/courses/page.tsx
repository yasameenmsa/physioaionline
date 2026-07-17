import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { escapeRegex } from '@/lib/escape-regex';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import Course from '@/models/Course';
import { Plus, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/features/courses/CourseCard';

const catKey: Record<string, string> = {
  'Assessment & Examination': 'assessment',
  Cardiopulmonary: 'cardiopulmonary',
  Electrotherapy: 'electrotherapy',
  'Mobility & Positioning': 'mobility',
  Neurology: 'neurology',
  Orthopedics: 'orthopedics',
  Pediatrics: 'pediatrics',
  'Professional Practice': 'professional',
  'Research & Statistics': 'research',
  'Therapeutic Exercise': 'therapeutic',
};

interface SearchParams {
  category?: string;
  level?: string;
  search?: string;
  page?: string;
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const t = await getTranslations('courses.list');
  const tc = await getTranslations('courses.categories');
  await connectDB();

  const category = params.category || '';
  const level = params.level || '';
  const search = params.search || '';
  const page = parseInt(params.page || '1', 10);
  const limit = 12;

  const filter: Record<string, any> = {};
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };

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

  const categories = await Course.distinct('category', {
    category: { $ne: '' },
  });

  const mapped = courses.map((c: any) => ({
    _id: c._id.toString(),
    slug: c.slug,
    title: c.title,
    description: c.description || '',
    image: c.image || '',
    price: c.price || 0,
    level: c.level || 'beginner',
    instructor: c.instructor
      ? {
          _id: c.instructor._id.toString(),
          name: c.instructor.name,
        }
      : null,
    lessonCount:
      c.sections?.reduce(
        (sum: number, s: any) => sum + (s.lessons?.length || 0),
        0
      ) || 0,
    totalDuration:
      c.sections?.reduce(
        (sum: number, s: any) =>
          sum +
          (s.lessons?.reduce(
            (ls: number, l: any) => ls + (l.duration || 0),
            0
          ) || 0),
        0
      ) || 0,
    sectionCount: c.sections?.length || 0,
    createdAt: c.createdAt?.toISOString(),
  }));

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('description')}
            </p>
          </div>
          {session?.user && (
            <Button asChild>
              <Link href="/courses/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('create')}
              </Link>
            </Button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/courses"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tc('all')}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/courses?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {catKey[cat] ? tc(catKey[cat]) : cat}
              </Link>
            ))}
          </div>
        )}

        {mapped.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mapped.map((c: any) => (
                <CourseCard key={c._id} course={c} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/courses?page=${page - 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
                  >
                    {t('previous')}
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  {t('page')} {page} {t('of')} {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/courses?page=${page + 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
                  >
                    {t('next')}
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {t('noCourses')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {search
                ? t('noCoursesSearch')
                : t('noCoursesPublished')}
            </p>
            {session?.user && (
              <Button asChild>
                <Link href="/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createFirst')}
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
