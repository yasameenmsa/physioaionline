'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { WorkshopEditor } from '@/components/features/workshops/WorkshopEditor';

export default function EditWorkshopPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('admin.editor');
  const slug = params.slug as string;
  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/workshops/${slug}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setWorkshop(json.data);
      } catch (err: any) {
        setError(err.message || t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function handleSave(sections: any[]) {
    const res = await fetch(`/api/workshops/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <WorkshopEditor
        workshopId={workshop._id}
        initialSections={workshop.sections || []}
        language={workshop.language || 'en'}
        onSave={handleSave}
      />
    </div>
  );
}
