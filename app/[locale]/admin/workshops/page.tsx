import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { escapeRegex } from '@/lib/escape-regex';
import Workshop from '@/models/Workshop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Eye, EyeOff, Trash2, ToggleLeft, ToggleRight, Search, Pencil } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
  params: Promise<{ locale: string }>;
}

async function getWorkshops(page: number, search: string) {
  await connectDB();
  const limit = 20;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (search) {
    const escaped = escapeRegex(search);
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { category: { $regex: escaped, $options: 'i' } },
    ];
  }

  const [workshops, total] = await Promise.all([
    Workshop.find(filter)
      .populate('instructor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Workshop.countDocuments(filter),
  ]);

  return {
    workshops: workshops.map((w: any) => ({
      ...w,
      _id: w._id.toString(),
      instructor: w.instructor ? { name: w.instructor.name } : null,
      lessonCount: w.sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0) || 0,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function AdminWorkshopsPage({ searchParams, params }: PageProps) {
  const { locale } = await params;
  const { page: pageStr, search } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const t = await getTranslations({ locale, namespace: 'admin.workshops' });

  const { workshops, total, totalPages } = await getWorkshops(currentPage, search || '');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{total} {t('total')}</p>
        </div>
        <Link
          href="/workshops/create"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> {t('newWorkshop')}
        </Link>
      </div>

      <div className="rounded-lg border">
        {workshops.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center">{t('noWorkshops')}</p>
        ) : (
          <div className="divide-y">
            {workshops.map((w: any) => (
              <div key={w._id} className="flex items-center justify-between p-4 text-sm">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{w.title}</p>
                    {w.published ? (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded shrink-0">{t('published')}</span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded shrink-0">{t('draft')}</span>
                    )}
                    {w.language && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {w.language === 'ar' ? 'عربي' : 'EN'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {w.instructor && <span>{w.instructor.name}</span>}
                    {w.category && <span>{w.category}</span>}
                    <span>{w.lessonCount} {t('lessons')}</span>
                    <span>{w.sections?.length || 0} {t('sections')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/workshops/${w.slug}`} className="text-xs text-primary hover:underline">
                    {t('view')}
                  </Link>
                  <Link
                    href={`/admin/workshops/${w.slug}/edit`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link href={`/admin/workshops?page=${currentPage - 1}${search ? `&search=${search}` : ''}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('previous')}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{t('page')} {currentPage} {t('of')} {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/workshops?page=${currentPage + 1}${search ? `&search=${search}` : ''}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
