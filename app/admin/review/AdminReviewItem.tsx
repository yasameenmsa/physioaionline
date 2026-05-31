'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { Check, X, ExternalLink } from 'lucide-react';

interface ArticleData {
  _id: string;
  title: string;
  slug: string;
  author: { _id: string; name: string; email: string } | null;
  category: { name: string } | null;
  createdAt: string;
  tags: string[];
}

export function AdminReviewItem({ article }: { article: ArticleData }) {
  const router = useRouter();
  const [action, setAction] = useState<'idle' | 'approving' | 'rejecting'>('idle');
  const [expanded, setExpanded] = useState(false);

  async function handleAction(status: 'published' | 'draft') {
    setAction(status === 'published' ? 'approving' : 'rejecting');
    try {
      const res = await fetch(`/api/admin/articles/${article.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } finally {
      setAction('idle');
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 text-xs font-medium">
              Pending
            </span>
            {article.category && (
              <span className="text-xs text-muted-foreground">{article.category.name}</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-left hover:text-primary w-full"
          >
            {article.title}
          </button>
          {expanded && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
              Submitted by {article.author?.name || 'Unknown'} · {article.author?.email}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateTime(article.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/articles/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleAction('published')}
            disabled={action !== 'idle'}
          >
            {action === 'approving' ? (
              '...'
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleAction('draft')}
            disabled={action !== 'idle'}
          >
            {action === 'rejecting' ? (
              '...'
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Send Back
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
