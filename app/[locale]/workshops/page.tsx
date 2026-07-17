'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { WorkshopCard } from '@/components/features/workshops/WorkshopCard';
import { LanguageFilter } from '@/components/features/workshops/LanguageFilter';

export default function WorkshopsPage() {
  const t = useTranslations('workshops');
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetchWorkshops();
    fetchSession();
  }, [language]);

  async function fetchSession() {
    try {
      const res = await fetch('/api/auth/session');
      const json = await res.json();
      setSession(json);
    } catch {}
  }

  async function fetchWorkshops() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (language) params.set('language', language);
      const res = await fetch(`/api/workshops?${params}`);
      const json = await res.json();
      if (json.success) setWorkshops(json.data.workshops);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        {session?.user && (
          <Link href="/workshops/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> {t('createWorkshop')}
            </Button>
          </Link>
        )}
      </div>

      <LanguageFilter onFilter={setLanguage} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : workshops.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-muted-foreground text-lg">No workshops yet</p>
          {session?.user && (
            <Link href="/workshops/create">
              <Button>Create your first workshop</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop: any) => (
            <WorkshopCard key={workshop._id} workshop={workshop} />
          ))}
        </div>
      )}
    </div>
  );
}
