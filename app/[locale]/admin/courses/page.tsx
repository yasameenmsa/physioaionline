import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Course from '@/models/Course';
import { GraduationCap, Eye, DollarSign, Pencil } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function AdminCoursesPage({ searchParams, params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { locale } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 20;
  const skip = (currentPage - 1) * limit;
  const t = await getTranslations({ locale, namespace: 'admin.courses' });

  await connectDB();

  const [courses, total] = await Promise.all([
    Course.find()
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{total} {t('total')}</p>
        </div>
        <Link
          href="/courses/create"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {t('create')}
        </Link>
      </div>

      <div className="rounded-lg border">
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center">{t('noCourses')}</p>
        ) : (
          <div className="divide-y">
            {courses.map((item) => {
              const c = item as any;
              return (
                <div key={c._id.toString()} className="flex items-center justify-between p-4 text-sm">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{c.title}</p>
                      {!c.published && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded">Draft</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {c.instructor && <span>{(c.instructor as any).name}</span>}
                      {c.category && <span>{c.category}</span>}
                      <span>{c.level}</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {c.price > 0 ? `$${c.price}` : 'Free'}
                      </span>
                      <span>{c.sections?.length || 0} sections</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/courses/${c.slug}`} className="text-xs text-primary hover:underline">
                      {t('view')}
                    </Link>
                    <Link
                      href={`/admin/courses/${c.slug}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link href={`/admin/courses?page=${currentPage - 1}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('previous')}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{t('page')} {currentPage} {t('of')} {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/courses?page=${currentPage + 1}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
