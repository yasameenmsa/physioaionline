'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Upload, X, Eye, Edit3, Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownGuide = [
  { syntax: '# Heading 1', desc: 'Main heading' },
  { syntax: '## Heading 2', desc: 'Section heading' },
  { syntax: '### Heading 3', desc: 'Subsection heading' },
  { syntax: '**bold text**', desc: 'Bold text' },
  { syntax: '*italic text*', desc: 'Italic text' },
  { syntax: '[text](url)', desc: 'Link' },
  { syntax: '`code`', desc: 'Inline code' },
  { syntax: '```language\\ncode\\n```', desc: 'Code block' },
  { syntax: '- list item', desc: 'Bullet list' },
  { syntax: '1. item', desc: 'Numbered list' },
  { syntax: '> quote', desc: 'Blockquote' },
  { syntax: '---', desc: 'Horizontal rule' },
  { syntax: '![alt](url)', desc: 'Image' },
];

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    excerpt: '',
    body: '',
    tags: '',
  });
  const [references, setReferences] = useState<string[]>([]);
  const [refInput, setRefInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

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

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          excerpt: form.excerpt,
          body: form.body,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
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

  return (
    <div>
      <Link
        href="/dashboard/contributions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Articles
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Write New Article</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Guide
            {showGuide ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => { setPreview(!preview); setShowGuide(false); }}
          >
            {preview ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {showGuide && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold mb-3">Article Writing Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground mb-2">Structure Tips</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Start with a clear, descriptive title</li>
                  <li>• Write a brief summary in the excerpt field</li>
                  <li>• Use headings to organise sections</li>
                  <li>• Include evidence-based references</li>
                  <li>• Add relevant tags for discoverability</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-2">Example Structure</p>
                <pre className="text-xs text-muted-foreground bg-background rounded p-2 border">
{`# Title

## Introduction
Brief background...

## Main Content
Key information...

## Clinical Implications
Practical takeaways...

## References
- https://doi.org/...`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showGuide && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold mb-3">Markdown Formatting Guide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {markdownGuide.map((item) => (
                <div key={item.syntax} className="flex items-center gap-2 p-1.5 rounded bg-background border text-muted-foreground">
                  <code className="text-xs font-mono shrink-0">{item.syntax.replace(/\\n/g, '\n')}</code>
                  <span className="text-xs">{item.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Management of ACL Injuries in Athletes"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Clear, descriptive title for your article</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. rehabilitation, knee, sports medicine"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated keywords</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={2}
                maxLength={300}
                placeholder="A brief summary that appears in article cards and search results"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.excerpt.length}/300 characters</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Featured Image</label>
              <p className="text-xs text-muted-foreground mb-2">An optional image to accompany your article</p>
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
                  <img src={imageUrl} alt="" className="w-full h-auto max-h-48 object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Article Body (Markdown)</label>
                <span className="text-xs text-muted-foreground">{form.body.length} characters</span>
              </div>
              {preview ? (
                <div className="min-h-[400px] rounded-md border bg-background p-6 prose prose-sm max-w-none dark:prose-invert">
                  {form.body ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body}</ReactMarkdown>
                  ) : (
                    <p className="text-muted-foreground">Nothing to preview</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono leading-relaxed"
                  rows={20}
                  required
                  placeholder={`# Introduction

Start writing your article here...

## Methods

Describe your approach...

## Results

Present your findings...

## Discussion

Interpret the results...

## Conclusion

Summarise key takeaways...`}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">References</label>
              <p className="text-xs text-muted-foreground mb-2">Add links to evidence sources, research papers, or guidelines</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReference())}
                  placeholder="https://doi.org/..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="button" variant="outline" size="sm" onClick={addReference}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {references.length > 0 && (
                <ul className="space-y-1">
                  {references.map((ref, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex-1 truncate">{ref}</span>
                      <button type="button" onClick={() => removeReference(i)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
          <Link href="/dashboard/contributions">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
