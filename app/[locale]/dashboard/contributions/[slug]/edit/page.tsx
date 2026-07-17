'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft, Upload, X, Eye, Edit3, Plus, Trash2, BookOpen,
  ChevronDown, ChevronUp, FileText, ImageIcon, Link2, Tags,
  AlertCircle, Check, Loader2
} from 'lucide-react';
import { BlockEditor } from '@/components/features/articles/BlockEditor';
import { ArticleBlocks } from '@/components/features/articles/ArticleBlocks';
import { generateBodyFromBlocks } from '@/lib/blocks';
import type { Block } from '@/lib/blocks';
import { DeleteArticleButton } from '@/components/features/articles/DeleteArticleButton';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    excerpt: '',
    body: '',
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch(`/api/articles/${slug}`).then((r) => r.json()),
    ]).then(([catData, artData]) => {
      setCategories(catData.data || []);
      const a = artData.data;
      if (a) {
        setForm({
          title: a.title,
          category: a.category?._id || '',
          excerpt: a.excerpt || '',
          body: a.body,
        });
        setImageUrl(a.imageUrl || '');
        setReferences(a.references || []);
        setTagList(a.tags || []);
        if (a.blocks) {
          try {
            setBlocks(JSON.parse(a.blocks));
          } catch {
            setBlocks([]);
          }
        }
      }
      setLoading(false);
    });
  }, [slug]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setImageUrl(data.data.url);
      else setError(data.error || 'Upload failed');
    } catch { setError('Upload failed'); }
    finally { setIsUploading(false); }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tagList.includes(tag)) {
      setTagList([...tagList, tag]);
      setTagInput('');
    }
  }

  function removeTag(index: number) {
    setTagList(tagList.filter((_, i) => i !== index));
  }

  function addReference() {
    const url = refInput.trim();
    if (url && !references.includes(url)) {
      setReferences([...references, url]);
      setRefInput('');
    }
  }

  function removeReference(index: number) {
    setReferences(references.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const body = blocks.length > 0 ? generateBodyFromBlocks(blocks) : form.body;

    try {
      const res = await fetch(`/api/articles/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          excerpt: form.excerpt,
          body,
          blocks: blocks.length > 0 ? blocks : undefined,
          tags: tagList,
          imageUrl: imageUrl || undefined,
          references,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to update article');
        setSubmitting(false);
        return;
      }

      router.push('/dashboard/contributions');
      router.refresh();
    } catch {
      setError('Something went wrong');
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading...</div>;
  }

  const hasContent = blocks.length > 0 || form.body.length > 0;
  const isValid = form.title && form.category && hasContent;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/contributions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">Edit Article</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your article content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowGuide(!showGuide)}>
            <BookOpen className="h-4 w-4 me-2" />
            Guide
            {showGuide ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => { setPreview(!preview); setShowGuide(false); }}>
            {preview ? <Edit3 className="h-4 w-4 me-2" /> : <Eye className="h-4 w-4 me-2" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
            <CardDescription>Update the essential details for your article</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required>
                  <option value="">Select a category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add a tag..." />
                  <Button type="button" variant="outline" size="icon" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                </div>
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagList.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => removeTag(i)} className="hover:text-primary/70"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="excerpt">Excerpt</Label>
                <span className="text-xs text-muted-foreground">{form.excerpt.length}/300</span>
              </div>
              <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} maxLength={300} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">Featured Image</CardTitle>
            </div>
            <CardDescription>Update the article&apos;s featured image</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Choose Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
              </label>
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl('')} className="text-sm text-destructive hover:underline">
                  <X className="h-4 w-4 inline" /> Remove
                </button>
              )}
            </div>
            {imageUrl && (
              <div className="mt-3 rounded-md border overflow-hidden max-w-sm">
                <img src={imageUrl} alt="Article preview image" className="w-full h-auto max-h-48 object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-lg">Article Content</CardTitle>
              </div>
              {blocks.length > 0 && <span className="text-xs text-muted-foreground">{blocks.length} blocks</span>}
            </div>
            <CardDescription>Edit your article content using the block editor</CardDescription>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="min-h-[400px] rounded-lg border bg-background p-8">
                {blocks.length > 0 ? (
                  <ArticleBlocks blocks={blocks} />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: form.body }} />
                )}
              </div>
            ) : (
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">References</CardTitle>
            </div>
            <CardDescription>Update evidence sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input type="url" value={refInput} onChange={(e) => setRefInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReference())} placeholder="https://doi.org/..." />
              <Button type="button" variant="outline" size="icon" onClick={addReference}><Plus className="h-4 w-4" /></Button>
            </div>
            {references.length > 0 ? (
              <ul className="space-y-2">
                {references.map((ref, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                      <span className="truncate text-muted-foreground">{ref}</span>
                    </div>
                    <button type="button" onClick={() => removeReference(i)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"><X className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                <p className="text-sm text-muted-foreground">No references added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between gap-4 pt-2 pb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isValid ? <><Check className="h-3.5 w-3.5 text-green-500" /> All required fields filled</> : <><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Title, category, and content are required</>}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/contributions"><Button type="button" variant="ghost">Cancel</Button></Link>
            <Button type="submit" disabled={submitting || !isValid} size="lg">
              {submitting ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />Saving...</> : <><Check className="h-4 w-4 me-2" />Save Changes</>}
            </Button>
            <DeleteArticleButton slug={slug} redirectTo="/dashboard/contributions" />
          </div>
        </div>
      </form>
    </div>
  );
}
