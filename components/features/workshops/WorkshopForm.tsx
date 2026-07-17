'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

interface WorkshopFormData {
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  tags: string;
  whatYouLearn: string;
  requirements: string;
  published: boolean;
}

interface WorkshopFormProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    image: string;
    price: number;
    category: string;
    level: string;
    language: string;
    tags: string[];
    whatYouLearn: string[];
    requirements: string[];
    published: boolean;
  };
}

export function WorkshopForm({ initialData }: WorkshopFormProps) {
  const router = useRouter();
  const t = useTranslations('admin.workshops');
  const isEditing = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<WorkshopFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    price: initialData?.price || 0,
    category: initialData?.category || '',
    level: (initialData?.level as any) || 'beginner',
    language: (initialData?.language as 'ar' | 'en') || 'en',
    tags: initialData?.tags?.join(', ') || '',
    whatYouLearn: initialData?.whatYouLearn?.join('\n') || '',
    requirements: initialData?.requirements?.join('\n') || '',
    published: initialData?.published || false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      alert(t('titleRequired'));
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        image: form.image,
        price: form.price,
        category: form.category,
        level: form.level,
        language: form.language,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        whatYouLearn: form.whatYouLearn.split('\n').map((t) => t.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').map((t) => t.trim()).filter(Boolean),
        published: form.published,
      };

      const url = isEditing ? `/api/workshops/${initialData.slug}` : '/api/workshops';
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      router.push(`/workshops/${json.data.slug}/edit`);
    } catch (err: any) {
      alert(err.message || t('failedToSave'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('workshopDetails')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="image">{t('coverImage')}</Label>
            <ImageUploadInput
              id="image"
              value={form.image}
              onChange={(value) => setForm((f) => ({ ...f, image: value }))}
              placeholder={t('coverImagePlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">{t('priceLabel')}</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">{t('levelLabel')}</Label>
            <select
              id="level"
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as any }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">{t('beginner')}</option>
              <option value="intermediate">{t('intermediate')}</option>
              <option value="advanced">{t('advanced')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">{t('languageLabel')}</Label>
            <select
              id="language"
              value={form.language}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as 'ar' | 'en' }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t('categoryLabel')}</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder={t('categoryPlaceholder')}
            />
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('descriptionLabel')}</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={t('descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="whatYouLearn">{t('whatYouLearn')}</Label>
            <Textarea
              id="whatYouLearn"
              value={form.whatYouLearn}
              onChange={(e) => setForm((f) => ({ ...f, whatYouLearn: e.target.value }))}
              placeholder={t('whatYouLearnPlaceholder')}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">{t('requirementsLabel')}</Label>
            <Textarea
              id="requirements"
              value={form.requirements}
              onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
              placeholder={t('requirementsPlaceholder')}
              rows={4}
            />
          </div>
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
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('saving')}</>
            ) : (
              isEditing ? t('update') : t('createWorkshop')
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
