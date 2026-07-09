'use client';

import { useState } from 'react';
import { NewsCard } from './NewsCard';
import { NewsLangToggle } from './NewsLangToggle';

interface NewsItem {
  _id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  excerpt: string;
  excerptAr: string | null;
  imageUrl: string | null;
  tags: string[];
  viewCount: number;
  publishedAt: string | null;
  author: { _id: string; name: string } | null;
}

interface NewsListClientProps {
  items: NewsItem[];
  locale: string;
}

export function NewsListClient({ items, locale }: NewsListClientProps) {
  const [lang, setLang] = useState<'en' | 'ar'>(locale as 'en' | 'ar');

  return (
    <>
      <div className="flex justify-end mb-6">
        <NewsLangToggle lang={lang} onToggle={setLang} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard
            key={item._id}
            _id={item._id}
            slug={item.slug}
            title={item.title}
            titleAr={item.titleAr}
            excerpt={item.excerpt}
            excerptAr={item.excerptAr}
            imageUrl={item.imageUrl}
            tags={item.tags}
            viewCount={item.viewCount}
            publishedAt={item.publishedAt}
            author={item.author}
            locale={locale}
            lang={lang}
          />
        ))}
      </div>
    </>
  );
}
