'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function UserJobForm() {
  const router = useRouter();
  const t = useTranslations('jobs');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    description: '',
    excerpt: '',
    applyUrl: '',
    contactEmail: '',
    tags: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) {
      alert(t('requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        description: form.description,
        excerpt: form.excerpt || form.title.slice(0, 200),
        applyUrl: form.applyUrl,
        contactEmail: form.contactEmail,
        tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      alert(t('submitted'));
      router.push('/jobs');
      router.refresh();
    } catch (err: any) {
      alert(err.message || t('failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 mx-auto">
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('form.title')} *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t('form.titlePlaceholder')}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company">{t('form.company')} *</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder={t('form.companyPlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location')}</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder={t('form.locationPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('form.type')}</Label>
          <select
            id="type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="full-time">{t('type.full-time')}</option>
            <option value="part-time">{t('type.part-time')}</option>
            <option value="remote">{t('type.remote')}</option>
            <option value="contract">{t('type.contract')}</option>
            <option value="internship">{t('type.internship')}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">{t('form.excerpt')}</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder={t('form.excerptPlaceholder')}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('form.description')} *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('form.descriptionPlaceholder')}
            rows={8}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applyUrl">{t('form.applyUrl')}</Label>
            <Input
              id="applyUrl"
              value={form.applyUrl}
              onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t('form.contactEmail')}</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              placeholder="hr@company.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">{t('form.tags')}</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder={t('form.tagsPlaceholder')}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {t('submitBtn')}
        </Button>
      </div>
    </form>
  );
}
