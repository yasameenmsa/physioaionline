'use client';

import Link from 'next/link';
import { Calendar, Eye, Tag } from 'lucide-react';

interface NewsCardProps {
  _id: string;
  slug: string;
  title: string;
  titleAr?: string;
  excerpt: string;
  excerptAr?: string;
  imageUrl?: string;
  tags?: string[];
  viewCount?: number;
  publishedAt?: string;
  author?: { _id: string; name: string } | null;
  locale?: string;
  lang?: 'en' | 'ar';
}

export function NewsCard({
  slug,
  title,
  titleAr,
  excerpt,
  excerptAr,
  imageUrl,
  tags,
  viewCount,
  publishedAt,
  author,
  locale = 'en',
  lang,
}: NewsCardProps) {
  const activeLang = lang || locale as 'en' | 'ar';
  const displayTitle = activeLang === 'ar' && titleAr ? titleAr : title;
  const displayExcerpt = activeLang === 'ar' && excerptAr ? excerptAr : excerpt;

  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString(activeLang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Link
      href={`/news/${slug}`}
      className="group block rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4 space-y-3" dir={activeLang === 'ar' ? 'rtl' : 'ltr'}>
        <h3 className="font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {displayTitle}
        </h3>
        {displayExcerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {displayExcerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {date}
            </span>
          )}
          {viewCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {viewCount}
            </span>
          )}
          {author && <span>{author.name}</span>}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
