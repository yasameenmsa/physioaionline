'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Check, X, Archive, Send, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminArticleStatusButtonProps {
  slug: string;
  currentStatus: string;
}

const STATUS_ACTIONS: Record<string, { label: string; icon: React.ElementType; color: string }[]> = {
  draft: [
    { label: 'Publish', icon: Send, color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30' },
    { label: 'Archive', icon: Archive, color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' },
  ],
  review: [
    { label: 'Publish', icon: Send, color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30' },
    { label: 'Reject', icon: X, color: 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30' },
    { label: 'Archive', icon: Archive, color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' },
  ],
  published: [
    { label: 'Unpublish', icon: Undo2, color: 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30' },
    { label: 'Archive', icon: Archive, color: 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' },
  ],
  archived: [
    { label: 'Restore', icon: Undo2, color: 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30' },
  ],
};

const ACTION_TO_STATUS: Record<string, string> = {
  Publish: 'published',
  Reject: 'draft',
  Unpublish: 'draft',
  Archive: 'archived',
  Restore: 'draft',
};

export function AdminArticleStatusButton({ slug, currentStatus }: AdminArticleStatusButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const actions = STATUS_ACTIONS[currentStatus] || [];

  async function handleChange(action: string) {
    const newStatus = ACTION_TO_STATUS[action];
    if (!newStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        title="Change status"
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-lg border bg-popover p-1 shadow-lg">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleChange(action.label)}
                disabled={loading}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors disabled:opacity-50',
                  action.color
                )}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
