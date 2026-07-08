import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { connectDB } from '@/lib/db';
import News from '@/models/News';
import { NewsCard } from '@/components/features/news/NewsCard';
import { Rss, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function NewsPage({ searchParams, params }: PageProps) {
  const { tag, page: pageStr } = await searchParams;
  const { locale } = await params;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 12;
  const skip = (currentPage - 1) * limit;
  const t = await getTranslations({ locale, namespace: 'news.list' });

  await connectDB();

  const filter: Record<string, unknown> = { published: true };
  if (tag) filter.tags = { $in: [tag] };

  const [news, total] = await Promise.all([
    News.find(filter)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    News.countDocuments(filter),
  ]);

  const allTags = await News.distinct('tags', {
    published: true,
    tags: { $ne: '', $exists: true },
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Rss className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          </div>
          <Link
            href="/news/create"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Submit News
          </Link>
        </div>
        <p className="text-muted-foreground mb-8">{t('description')}</p>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/news"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('all')}
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/news?tag=${encodeURIComponent(t)}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tag === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {news.length === 0 ? (
          <div className="text-center py-20">
            <Rss className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t('noNews')}</h2>
            <p className="text-muted-foreground mt-2">{t('noNewsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard
                  key={item._id.toString()}
                  _id={item._id.toString()}
                  slug={item.slug}
                  title={item.title}
                  excerpt={item.excerpt}
                  imageUrl={item.imageUrl}
                  tags={item.tags}
                  viewCount={item.viewCount}
                  publishedAt={item.publishedAt?.toISOString()}
                  author={
                    (item as any).author
                      ? {
                          _id: (item as any).author._id.toString(),
                          name: (item as any).author.name,
                        }
                      : null
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/news?page=${currentPage - 1}${tag ? `&tag=${tag}` : ''}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md border hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('previous')}
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  {t('page')} {currentPage} {t('of')} {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/news?page=${currentPage + 1}${tag ? `&tag=${tag}` : ''}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md border hover:bg-muted"
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
