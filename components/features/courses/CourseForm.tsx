'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, GripVertical, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ImageUploadInput } from '@/components/ui/ImageUploadInput';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
}

interface Lesson {
  title: string;
  videoId: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Section {
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseFormData {
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string;
  whatYouLearn: string;
  requirements: string;
  published: boolean;
}

interface CourseFormProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    image: string;
    price: number;
    category: string;
    level: string;
    tags: string[];
    whatYouLearn: string[];
    requirements: string[];
    published: boolean;
    sections: Section[];
  };
}

export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const t = useTranslations('courses.create');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [sections, setSections] = useState<Section[]>(initialData?.sections || []);
  const [form, setForm] = useState<CourseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    price: initialData?.price || 0,
    category: initialData?.category || '',
    level: (initialData?.level as any) || 'beginner',
    tags: initialData?.tags?.join(', ') || '',
    whatYouLearn: initialData?.whatYouLearn?.join('\n') || '',
    requirements: initialData?.requirements?.join('\n') || '',
    published: initialData?.published || false,
  });

  async function fetchYouTube() {
    if (!youtubeUrl.trim()) return;
    setFetching(true);
    try {
      const res = await fetch('/api/courses/fetch-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      const data = json.data;
      if (!form.title) {
        setForm((f) => ({ ...f, title: data.title }));
      }

      const sectionsData: Section[] = [
        {
          title: data.title || 'Course Content',
          order: 0,
          lessons: data.videos.map((v: YouTubeVideo, i: number) => ({
            title: v.title,
            videoId: v.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            duration: v.duration,
            order: i,
            isFree: i === 0,
          })),
        },
      ];
      setSections(sectionsData);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch YouTube data');
    } finally {
      setFetching(false);
    }
  }

  function addSection() {
    setSections((s) => [
      ...s,
      { title: '', order: s.length, lessons: [] },
    ]);
  }

  function updateSection(index: number, title: string) {
    setSections((s) =>
      s.map((sec, i) => (i === index ? { ...sec, title } : sec))
    );
  }

  function removeSection(index: number) {
    setSections((s) => s.filter((_, i) => i !== index));
  }

  function addLesson(sectionIndex: number) {
    setSections((s) =>
      s.map((sec, i) =>
        i === sectionIndex
          ? {
              ...sec,
              lessons: [
                ...sec.lessons,
                {
                  title: '',
                  videoId: '',
                  videoUrl: '',
                  duration: 0,
                  order: sec.lessons.length,
                  isFree: false,
                },
              ],
            }
          : sec
      )
    );
  }

  function updateLesson(
    sectionIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: any
  ) {
    setSections((s) =>
      s.map((sec, si) =>
        si === sectionIndex
          ? {
              ...sec,
              lessons: sec.lessons.map((les, li) =>
                li === lessonIndex ? { ...les, [field]: value } : les
              ),
            }
          : sec
      )
    );
  }

  function removeLesson(sectionIndex: number, lessonIndex: number) {
    setSections((s) =>
      s.map((sec, si) =>
        si === sectionIndex
          ? {
              ...sec,
              lessons: sec.lessons.filter((_, li) => li !== lessonIndex),
            }
          : sec
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !sections.length) {
      alert('Title and at least one section are required');
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
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        whatYouLearn: form.whatYouLearn
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        requirements: form.requirements
          .split('\n')
          .map((t) => t.trim())
          .filter(Boolean),
        published: form.published,
        sections,
      };

      const url = isEditing ? `/api/courses/${initialData.slug}` : '/api/courses';
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      router.push(isEditing ? '/admin/courses' : `/courses/${json.data.slug}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('importFromYoutube')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('importDescription')}
        </p>
        <div className="flex gap-2">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder={t('youtubePlaceholder')}
          />
          <Button
            type="button"
            onClick={fetchYouTube}
            disabled={fetching || !youtubeUrl.trim()}
          >
            {fetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Youtube className="h-4 w-4" />
            )}
            {t('fetch')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t('courseDetails')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('titleLabel')} *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder={t('titlePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">{t('imageUrl')}</Label>
            <ImageUploadInput
              id="image"
              value={form.image}
              onChange={(value) =>
                setForm((f) => ({ ...f, image: value }))
              }
              placeholder={t('imageUrl')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">
              {t('priceLabel')}
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  price: parseFloat(e.target.value) || 0,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">{t('levelLabel')}</Label>
            <select
              id="level"
              value={form.level}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  level: e.target.value as any,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="beginner">{t('beginner')}</option>
              <option value="intermediate">{t('intermediate')}</option>
              <option value="advanced">{t('advanced')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t('categoryLabel')}</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              placeholder={t('categoryPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t('tagsLabel')}</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags: e.target.value }))
              }
              placeholder={t('tagsPlaceholder')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('descriptionLabel')}</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder={t('descriptionPlaceholder')}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="whatYouLearn">
              {t('whatYouLearn')}
            </Label>
            <Textarea
              id="whatYouLearn"
              value={form.whatYouLearn}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  whatYouLearn: e.target.value,
                }))
              }
              placeholder={t('whatYouLearnPlaceholder')}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements">
              {t('requirements')}
            </Label>
            <Textarea
              id="requirements"
              value={form.requirements}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  requirements: e.target.value,
                }))
              }
              placeholder={t('requirementsPlaceholder')}
              rows={4}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('courseContent', { count: sections.length })}
          </h2>
          <Button type="button" variant="outline" onClick={addSection}>
            <Plus className="h-4 w-4 mr-1" /> {t('addSection')}
          </Button>
        </div>

        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('noSections')}
          </p>
        )}

        <div className="space-y-4">
          {sections.map((section, si) => (
            <div
              key={si}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(si, e.target.value)}
                  placeholder={t('sectionTitle', { number: si + 1 })}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(si)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="pl-6 space-y-2">
                {section.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="flex items-center gap-2 bg-muted/50 rounded p-2"
                  >
                    <Input
                      value={lesson.title}
                      onChange={(e) =>
                        updateLesson(si, li, 'title', e.target.value)
                      }
                      placeholder={t('lessonTitle')}
                      className="flex-1 text-sm"
                    />
                    <Input
                      value={lesson.videoUrl}
                      onChange={(e) => {
                        updateLesson(si, li, 'videoUrl', e.target.value);
                        const vid =
                          e.target.value.match(
                            /(?:v=|youtu\.be\/|embed\/)([^&?]+)/
                          )?.[1] || '';
                        updateLesson(si, li, 'videoId', vid);
                      }}
                      placeholder={t('youtubeUrl')}
                      className="w-48 text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs shrink-0">
                      <input
                        type="checkbox"
                        checked={lesson.isFree}
                        onChange={(e) =>
                          updateLesson(
                            si,
                            li,
                            'isFree',
                            e.target.checked
                          )
                        }
                      />
                      {t('free')}
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLesson(si, li)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addLesson(si)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> {t('addLesson')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((f) => ({ ...f, published: e.target.checked }))
            }
          />
          {t('publishImmediately')}
        </label>
        <div className="flex gap-2">
          {isEditing && (
            <Button type="button" variant="outline" onClick={() => router.push('/admin/courses')}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading || !sections.length}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {isEditing ? 'Saving...' : t('creating')}
            </>
          ) : (
              isEditing ? 'Update Course' : t('createCourse')
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
