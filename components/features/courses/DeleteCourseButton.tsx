'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DeleteCourseButton({
  slug,
  redirectTo,
}: {
  slug: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const t = useTranslations('courses.delete');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(t('confirm'))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/courses/${slug}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert(t('failed'));
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
      {deleting ? '...' : t('label')}
    </button>
  );
}
