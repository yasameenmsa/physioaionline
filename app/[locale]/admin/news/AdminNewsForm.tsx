'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

interface AdminNewsFormProps {
  initialData?: {
    slug: string;
    title: string;
    titleAr?: string;
    content: string;
    contentAr?: string;
    excerpt: string;
    excerptAr?: string;
    imageUrl: string;
    tags: string[];
    published: boolean;
  };
}

export function AdminNewsForm({ initialData }: AdminNewsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || '',
    titleAr: initialData?.titleAr || '',
    content: initialData?.content || '',
    contentAr: initialData?.contentAr || '',
    excerpt: initialData?.excerpt || '',
    excerptAr: initialData?.excerptAr || '',
    imageUrl: initialData?.imageUrl || '',
    tags: initialData?.tags?.join(', ') || '',
    published: initialData?.published || false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const body = {
        title: form.title,
        titleAr: form.titleAr,
        content: form.content,
        contentAr: form.contentAr,
        excerpt: form.excerpt || form.title.slice(0, 200),
        excerptAr: form.excerptAr,
        imageUrl: form.imageUrl,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: form.published,
      };

      const url = initialData
        ? `/api/news/${initialData.slug}`
        : '/api/news';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      router.push('/admin/news');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save news');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">English</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="News title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt (optional)</Label>
          <Textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="Short description for card preview"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="News content (HTML or markdown)"
            rows={12}
            required
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">العربية</h3>

        <div className="space-y-2">
          <Label htmlFor="titleAr">العنوان</Label>
          <Input
            id="titleAr"
            value={form.titleAr}
            onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
            placeholder="عنوان الخبر"
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerptAr">الملخص (اختياري)</Label>
          <Textarea
            id="excerptAr"
            value={form.excerptAr}
            onChange={(e) => setForm((f) => ({ ...f, excerptAr: e.target.value }))}
            placeholder="وصف مختصر لبطاقة المعاينة"
            rows={2}
            dir="rtl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentAr">المحتوى</Label>
          <Textarea
            id="contentAr"
            value={form.contentAr}
            onChange={(e) => setForm((f) => ({ ...f, contentAr: e.target.value }))}
            placeholder="محتوى الخبر (HTML أو Markdown)"
            rows={12}
            dir="rtl"
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <ImageUploadInput
            id="imageUrl"
            value={form.imageUrl}
            onChange={(value) => setForm((f) => ({ ...f, imageUrl: value }))}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="physiotherapy, rehabilitation, research"
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
          Publish immediately
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  );
}
