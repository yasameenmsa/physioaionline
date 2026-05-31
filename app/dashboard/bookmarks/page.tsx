'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleCard } from '@/components/features/articles/ArticleCard';
import { Bookmark, ExternalLink } from 'lucide-react';

interface BookmarkItem {
  _id: string;
  articleId: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: { name: string; slug: string } | null;
    author: { name: string } | null;
    publishedAt: string;
    viewCount: number;
    tags: string[];
  };
  createdAt: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((d) => {
        setBookmarks(d.data || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Saved Articles</h2>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 border rounded-lg">
          <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No bookmarks yet</h3>
          <p className="text-muted-foreground mt-2">
            Save articles while browsing the knowledge base to read them later
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-primary hover:underline mt-4 text-sm"
          >
            Browse Knowledge Base
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bookmarks.map((b) => {
            const a = b.articleId;
            if (!a) return null;
            return (
              <ArticleCard
                key={b._id}
                title={a.title}
                slug={a.slug}
                excerpt={a.excerpt || ''}
                imageUrl={(a as any).imageUrl}
                category={a.category}
                author={a.author}
                publishedAt={a.publishedAt}
                viewCount={a.viewCount}
                tags={a.tags || []}
                className="border-primary/10"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
