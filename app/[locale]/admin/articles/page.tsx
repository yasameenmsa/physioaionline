import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Article from '@/models/Article';
import Category from '@/models/Category';
import { Plus, Eye, Calendar, Pencil, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DeleteArticleButton } from '@/components/features/articles/DeleteArticleButton';
import { AdminArticleStatusButton } from './AdminArticleStatusButton';

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string; category?: string }>;
  params: Promise<{ locale: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default async function AdminArticlesPage({ searchParams, params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { locale } = await params;
  const { page: pageStr, status, q, category } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 20;
  const skip = (currentPage - 1) * limit;
  const t = await getTranslations({ locale, namespace: 'admin.articles' });

  await connectDB();

  const filter: Record<string, any> = {};
  if (status && status !== 'all') filter.status = status;
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const [articles, total, categories] = await Promise.all([
    Article.find(filter)
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(filter),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  const totalPages = Math.ceil(total / limit);

  const statusCounts = await Promise.all(
    ['draft', 'review', 'published', 'archived'].map(async (s) => ({
      status: s,
      count: await Article.countDocuments({ ...filter, status: s, ...(filter.status ? {} : {}) }),
    }))
  );

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (overrides.page) sp.set('page', overrides.page);
    if (overrides.status && overrides.status !== 'all') sp.set('status', overrides.status);
    if (overrides.q) sp.set('q', overrides.q);
    if (overrides.category) sp.set('category', overrides.category);
    const qs = sp.toString();
    return `/admin/articles${qs ? `?${qs}` : ''}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{total} {t('total')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['all', 'draft', 'review', 'published', 'archived'] as const).map((s) => {
          const isActive = (status || 'all') === s;
          const count = s === 'all' ? total : statusCounts.find((sc) => sc.status === s)?.count || 0;
          return (
            <Link
              key={s}
              href={buildUrl({ status: s, q, category, page: undefined })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                isActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-muted-foreground hover:bg-muted border-border'
              }`}
            >
              {s === 'all' ? t('all') : t(s)}
              <span className="font-medium">{count}</span>
            </Link>
          );
        })}
      </div>

      <form className="flex items-center gap-2 mb-4" action="/admin/articles" method="get">
        <input type="hidden" name="status" value={status || 'all'} />
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          name="category"
          defaultValue={category || ''}
          className="px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('allCategories')}</option>
          {(categories as any[]).map((c) => (
            <option key={c._id.toString()} value={c._id.toString()}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="px-3 py-2 text-sm rounded-md border hover:bg-muted transition-colors">
          {t('filter')}
        </button>
      </form>

      <div className="rounded-lg border">
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center">{t('noArticles')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">{t('table.title')}</th>
                  <th className="text-left p-3 font-medium hidden sm:table-cell">{t('table.author')}</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">{t('table.category')}</th>
                  <th className="text-left p-3 font-medium">{t('table.status')}</th>
                  <th className="text-right p-3 font-medium hidden sm:table-cell">{t('table.views')}</th>
                  <th className="text-right p-3 font-medium hidden lg:table-cell">{t('table.date')}</th>
                  <th className="text-right p-3 font-medium">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(articles as any[]).map((article) => (
                  <tr key={article._id.toString()} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {article.imageUrl && (
                          <img src={article.imageUrl} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <Link href={`/articles/${article.slug}`} className="font-medium hover:text-primary truncate block">
                            {article.title}
                          </Link>
                          {article.excerpt && (
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{article.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="text-muted-foreground">{(article.author as any)?.name || '—'}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-muted-foreground">{(article.category as any)?.name || '—'}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[article.status] || ''}`}>
                        {t(article.status)}
                      </span>
                    </td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {article.viewCount}
                      </span>
                    </td>
                    <td className="p-3 text-right hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.publishedAt || article.createdAt)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <AdminArticleStatusButton
                          slug={article.slug}
                          currentStatus={article.status}
                        />
                        <Link
                          href={`/articles/${article.slug}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={t('table.view')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/dashboard/contributions/${article.slug}/edit`}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={t('table.edit')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <DeleteArticleButton slug={article.slug} className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors [&>svg]:h-3.5 [&>svg]:w-3.5 [&>span]:hidden" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link href={buildUrl({ page: String(currentPage - 1), status, q, category })} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('previous')}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{t('page')} {currentPage} {t('of')} {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={buildUrl({ page: String(currentPage + 1), status, q, category })} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
