import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';
import { connectDB } from '@/lib/db';
import News from '@/models/News';

const NewsArticleClient = dynamic(
  () => import('@/components/features/news/NewsArticleClient').then((m) => m.NewsArticleClient),
  { loading: () => <div className="min-h-screen bg-background" /> }
);

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news.detail' });
  await connectDB();

  const newsItem = await News.findOne({ slug, published: true })
    .populate('author', 'name')
    .lean();

  if (!newsItem) notFound();

  await News.updateOne({ slug }, { $inc: { viewCount: 1 } });

  const item = newsItem as any;
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen bg-background">
      <NewsArticleClient
        slug={String(item.slug)}
        title={String(item.title)}
        titleAr={item.titleAr ? String(item.titleAr) : null}
        content={String(item.content)}
        contentAr={item.contentAr ? String(item.contentAr) : null}
        imageUrl={item.imageUrl ? String(item.imageUrl) : null}
        tags={Array.isArray(item.tags) ? [...item.tags] : []}
        viewCount={Number(item.viewCount) + 1}
        authorName={item.author?.name || null}
        date={date}
        locale={locale}
        backLabel={t('back')}
        backToNewsLabel={t('backToNews')}
      />
    </div>
  );
}
