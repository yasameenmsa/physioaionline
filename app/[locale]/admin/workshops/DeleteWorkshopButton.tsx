'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DeleteWorkshopButton({ slug }: { slug: string }) {
  const router = useRouter();
  const t = useTranslations('admin.workshops');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(t('deleteConfirm'))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workshops/${slug}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      router.refresh();
    } catch {
      alert(t('deleteFailed'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3" />
      {deleting ? '...' : t('delete')}
    </button>
  );
}
