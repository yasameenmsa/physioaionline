'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface AdminJobFormProps {
  initialData?: {
    slug: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    excerpt: string;
    logoUrl: string;
    imageUrl: string;
    applyUrl: string;
    contactEmail: string;
    tags: string[];
    published: boolean;
  };
}

export function AdminJobForm({ initialData }: AdminJobFormProps) {
  const router = useRouter();
  const t = useTranslations('admin.jobs');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    type: initialData?.type || 'full-time',
    description: initialData?.description || '',
    excerpt: initialData?.excerpt || '',
    logoUrl: initialData?.logoUrl || '',
    imageUrl: initialData?.imageUrl || '',
    applyUrl: initialData?.applyUrl || '',
    contactEmail: initialData?.contactEmail || '',
    tags: initialData?.tags?.join(', ') || '',
    published: initialData?.published || false,
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
        logoUrl: form.logoUrl,
        imageUrl: form.imageUrl,
        applyUrl: form.applyUrl,
        contactEmail: form.contactEmail,
        tags: form.tags.split(',').map((x) => x.trim()).filter(Boolean),
        published: form.published,
      };

      const url = initialData
        ? `/api/jobs/${initialData.slug}`
        : '/api/jobs';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      router.push('/admin/jobs');
      router.refresh();
    } catch (err: any) {
      alert(err.message || t('failedToSave'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Card className="p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">{t('titleLabel')} *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t('titlePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">{t('companyLabel')} *</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder={t('companyPlaceholder')}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="location">{t('locationLabel')}</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder={t('locationPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t('typeLabel')}</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="full-time">{t('typeFullTime')}</option>
              <option value="part-time">{t('typePartTime')}</option>
              <option value="remote">{t('typeRemote')}</option>
              <option value="contract">{t('typeContract')}</option>
              <option value="internship">{t('typeInternship')}</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">{t('excerptLabel')}</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder={t('excerptPlaceholder')}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('descriptionLabel')} *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('descriptionPlaceholder')}
            rows={10}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">{t('logoUrlLabel')}</Label>
            <Input
              id="logoUrl"
              value={form.logoUrl}
              onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://.../logo.png"
            />
            {form.logoUrl && (
              <img
                src={form.logoUrl}
                alt="logo"
                className="h-12 w-12 rounded-lg object-cover border"
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t('imageUrlLabel')}</Label>
            <Input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://.../poster.png"
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="poster"
                className="h-12 w-12 rounded-lg object-cover border"
              />
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="applyUrl">{t('applyUrlLabel')}</Label>
            <Input
              id="applyUrl"
              value={form.applyUrl}
              onChange={(e) => setForm((f) => ({ ...f, applyUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t('contactEmailLabel')}</Label>
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
          <Label htmlFor="tags">{t('tagsLabel')}</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder={t('tagsPlaceholder')}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          {t('publishImmediately')}
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {initialData ? t('update') : t('createBtn')}
          </Button>
        </div>
      </div>
    </form>
  );
}
