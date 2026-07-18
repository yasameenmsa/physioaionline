import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import News from '@/models/News';
import { Plus, Eye, Calendar, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PublishNewsButton } from './PublishNewsButton';
import { DeleteNewsButton } from './DeleteNewsButton';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function AdminNewsPage({ searchParams, params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { locale } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 20;
  const skip = (currentPage - 1) * limit;
  const t = await getTranslations({ locale, namespace: 'admin.news' });

  await connectDB();

  const [news, total] = await Promise.all([
    News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    News.countDocuments(),
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
          href="/admin/news/create"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          {t('create')}
        </Link>
      </div>

      <div className="rounded-lg border">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center">{t('noNews')}</p>
        ) : (
          <div className="divide-y">
            {news.map((item) => (
              <div key={item._id.toString()} className="flex items-center justify-between p-4 text-sm">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.title}</p>
                    {!item.published && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded">{t('draft')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {item.author && <span>{(item.author as any).name}</span>}
                    {item.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.viewCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PublishNewsButton slug={item.slug} currentlyPublished={item.published} />
                  <Link href={`/news/${item.slug}`} className="text-xs text-primary hover:underline">
                    {t('view')}
                  </Link>
                  <Link
                    href={`/admin/news/${item.slug}/edit`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                    {t('edit')}
                  </Link>
                  <DeleteNewsButton slug={item.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link href={`/admin/news?page=${currentPage - 1}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('previous')}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{t('page')} {currentPage} {t('of')} {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/news?page=${currentPage + 1}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
