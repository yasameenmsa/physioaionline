'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteArticleButtonProps {
  slug: string;
  redirectTo?: string;
  className?: string;
}

export function DeleteArticleButton({ slug, redirectTo, className = '' }: DeleteArticleButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${slug}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Failed to delete article');
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      alert('Something went wrong');
    }
  }

  return (
    <button
      onClick={handleDelete}
      className={`inline-flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors ${className}`}
      title="Delete article"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </button>
  );
}
