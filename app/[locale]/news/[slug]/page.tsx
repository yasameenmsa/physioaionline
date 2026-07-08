import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { connectDB } from '@/lib/db';
import News from '@/models/News';
import { SafeImage } from '@/components/ui/SafeImage';
import { Calendar, Eye, User, ArrowLeft, Tag, Rss } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news.detail' });
  const tc = await getTranslations({ locale, namespace: 'news.list' });
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
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Link>

          {item.imageUrl && (
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-6 bg-muted">
              <SafeImage
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {item.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {item.author && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {item.author.name}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {item.viewCount + 1}
            </span>
          </div>

          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/news?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.content}
            </ReactMarkdown>
          </div>

          <div className="mt-12 pt-6 border-t">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Rss className="h-4 w-4" />
              {t('backToNews')}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
