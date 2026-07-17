'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PublishNewsButton({ slug, currentlyPublished }: { slug: string; currentlyPublished: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin.news');

  async function handleTogglePublish() {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/${slug}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      router.refresh();
    } catch (err: any) {
      alert(err.message || t('publishFailed'));
    } finally {
      setLoading(false);
    }
  }

  if (currentlyPublished) {
    return (
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600 disabled:opacity-50"
        title={t('unpublish')}
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
        {t('unpublish')}
      </button>
    );
  }

  return (
    <button
      onClick={handleTogglePublish}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
      title={t('approvePublish')}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      {t('approve')}
    </button>
  );
}
