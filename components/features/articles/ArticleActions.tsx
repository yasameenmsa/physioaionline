'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleActionsProps {
  articleId: string;
  slug: string;
}

export function ArticleActions({ articleId, slug }: ArticleActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((d) => {
        const bookmarks: Array<{ articleId: { _id: string } | string }> = d.data || [];
        const ids = bookmarks.map((b) =>
          typeof b.articleId === 'string' ? b.articleId : b.articleId?._id
        );
        setIsBookmarked(ids.includes(articleId));
      })
      .catch(() => {});

    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId }),
    }).catch(() => {});
  }, [articleId]);

  async function toggleBookmark() {
    setToggling(true);
    try {
      if (isBookmarked) {
        await fetch(`/api/bookmarks/${articleId}`, { method: 'DELETE' });
        setIsBookmarked(false);
      } else {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        });
        setIsBookmarked(true);
      }
    } finally {
      setToggling(false);
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={toggling}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm transition-colors',
        isBookmarked
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
      title={isBookmarked ? 'Remove bookmark' : 'Save article'}
    >
      <Bookmark
        className={cn('h-4 w-4', isBookmarked && 'fill-primary')}
      />
      {isBookmarked ? 'Saved' : 'Save'}
    </button>
  );
}
