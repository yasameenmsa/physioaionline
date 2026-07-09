'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { Calendar, Eye, User, ArrowLeft, Tag, Rss } from 'lucide-react';
import { NewsLangToggle } from './NewsLangToggle';

interface NewsArticleClientProps {
  slug: string;
  title: string;
  titleAr: string | null;
  content: string;
  contentAr: string | null;
  imageUrl: string | null;
  tags: string[];
  viewCount: number;
  authorName: string | null;
  date: string;
  locale: string;
  backLabel: string;
  backToNewsLabel: string;
}

export function NewsArticleClient({
  slug,
  title,
  titleAr,
  content,
  contentAr,
  imageUrl,
  tags,
  viewCount,
  authorName,
  date,
  locale,
  backLabel = 'Back',
  backToNewsLabel = 'Back to News',
}: NewsArticleClientProps) {
  const [lang, setLang] = useState<'en' | 'ar'>(locale as 'en' | 'ar');

  const displayTitle = lang === 'ar' && titleAr ? titleAr : title;
  const displayContent = lang === 'ar' && contentAr ? contentAr : content;

  return (
    <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <NewsLangToggle lang={lang} onToggle={setLang} />
        </div>

        {imageUrl && (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-6 bg-muted">
            <SafeImage
              src={imageUrl}
              alt={displayTitle}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {displayTitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {authorName && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {authorName}
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
            {viewCount}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
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

        <div className="prose prose-gray dark:prose-invert max-w-none" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
        </div>

        <div className="mt-12 pt-6 border-t">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Rss className="h-4 w-4" />
            {backToNewsLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
