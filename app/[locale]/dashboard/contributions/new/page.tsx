'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft, Upload, X, Eye, Edit3, BookOpen,
  ChevronDown, ChevronUp, Plus, Trash2, Link2,
  ImageIcon, FileText, Tags, AlertCircle, Check,
  Loader2, Youtube
} from 'lucide-react';
import { BlockEditor } from '@/components/features/articles/BlockEditor';
import { ArticleBlocks } from '@/components/features/articles/ArticleBlocks';
import { createBlock, generateBodyFromBlocks } from '@/lib/blocks';
import type { Block } from '@/lib/blocks';

const pageSections = [
  { id: 'meta', label: 'Basic Info' },
  { id: 'image', label: 'Featured Image' },
  { id: 'content', label: 'Content' },
  { id: 'references', label: 'References' },
];

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [activeSection, setActiveSection] = useState('meta');

  const [form, setForm] = useState({
    title: '',
    category: '',
    excerpt: '',
    body: '',
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [refInput, setRefInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  const setSectionRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function handleImageUpload(file: File) {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setImageUrl(data.data.url);
      else setError(data.error || 'Upload failed');
    } catch {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) handleImageUpload(file);
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
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          excerpt: form.excerpt || body.replace(/[#*`\n]/g, ' ').trim().slice(0, 200),
          body,
          blocks: blocks.length > 0 ? blocks : undefined,
          tags: tagList,
          imageUrl: imageUrl || undefined,
          references,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Failed to create article');
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

  const excerptLength = (form.excerpt || '').length;
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
        <span className="text-sm text-muted-foreground">New Article</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Write New Article</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share your knowledge with the physiotherapy community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
          >
            <BookOpen className="h-4 w-4 me-2" />
            Guide
            {showGuide ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setPreview(!preview); setShowGuide(false); }}
          >
            {preview ? <Edit3 className="h-4 w-4 me-2" /> : <Eye className="h-4 w-4 me-2" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {showGuide && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Article Structure</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Start with a clear, descriptive title</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Write a brief summary in the excerpt field</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Use headings to organise sections</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Include evidence-based references</li>
                  <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> Add relevant tags for discoverability</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Block Types</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {[
                    ['Heading', 'Section titles with H1-H3'],
                    ['Paragraph', 'Body text with styles'],
                    ['Image', 'Add images with captions'],
                    ['YouTube', 'Embed videos'],
                    ['Quote', 'Highlighted quotes'],
                    ['Code', 'Code blocks'],
                    ['List', 'Ordered/unordered lists'],
                    ['Divider', 'Separate sections'],
                  ].map(([type, desc]) => (
                    <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-background border">
                      <span className="text-xs font-bold">{type}</span>
                      <span className="text-xs text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-[160px_1fr] gap-8">
        <nav className="space-y-1 sticky top-24 self-start">
          {pageSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeSection === section.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div ref={setSectionRef('meta')} id="meta">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </div>
                <CardDescription>Provide the essential details for your article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Management of ACL Injuries in Athletes" required />
                  <p className="text-xs text-muted-foreground">Choose a clear, descriptive title</p>
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
                    <p className="text-xs text-muted-foreground">Press Enter to add each tag</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <span className={`text-xs ${excerptLength > 280 ? 'text-amber-500' : 'text-muted-foreground'}`}>{excerptLength}/300</span>
                  </div>
                  <Textarea id="excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} maxLength={300} placeholder="Brief summary for article cards and search results" />
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${excerptLength > 280 ? 'bg-amber-500' : excerptLength > 0 ? 'bg-primary' : ''}`} style={{ width: `${(excerptLength / 300) * 100}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div ref={setSectionRef('image')} id="image">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Featured Image</CardTitle>
                </div>
                <CardDescription>An optional image to make your article stand out</CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="relative rounded-lg border overflow-hidden group">
                    <img src={imageUrl} alt="Featured image preview" className="w-full h-48 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="sm" onClick={() => setImageUrl('')}><Trash2 className="h-4 w-4 me-2" />Remove Image</Button>
                    </div>
                  </div>
                ) : (
                  <div className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} className="hidden" disabled={isUploading} />
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full bg-muted p-3"><Upload className="h-6 w-6 text-muted-foreground" /></div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{isUploading ? 'Uploading...' : 'Drop an image here, or click to browse'}</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG or WebP up to 5MB</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                        {isUploading ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />Uploading</> : <><Upload className="h-4 w-4 me-2" />Choose Image</>}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div ref={setSectionRef('content')} id="content">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Article Content</CardTitle>
                  </div>
                  {blocks.length > 0 && <span className="text-xs text-muted-foreground">{blocks.length} blocks</span>}
                </div>
                <CardDescription>Build your article using blocks — add text, headings, images, YouTube videos, and more</CardDescription>
              </CardHeader>
              <CardContent>
                {preview ? (
                  <div className="min-h-[400px] rounded-lg border bg-background p-8">
                    {blocks.length > 0 ? (
                      <ArticleBlocks blocks={blocks} />
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-muted-foreground">No content yet. Switch back to edit mode and add blocks.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <BlockEditor blocks={blocks} onChange={setBlocks} />
                )}
              </CardContent>
            </Card>
          </div>

          <div ref={setSectionRef('references')} id="references">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">References</CardTitle>
                </div>
                <CardDescription>Add links to evidence sources, research papers, or clinical guidelines</CardDescription>
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
          </div>

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
                {submitting ? <><Loader2 className="h-4 w-4 me-2 animate-spin" />Submitting...</> : <><Check className="h-4 w-4 me-2" />Submit for Review</>}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
