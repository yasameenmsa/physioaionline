'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';

interface CategoryOption {
  _id: string;
  name: string;
}

interface QuestionFormProps {
  categories: CategoryOption[];
  initialData?: {
    questionText: string;
    category: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: string;
    source: string;
    imageUrl?: string;
    active: boolean;
  };
  isEditing?: boolean;
  questionId?: string;
}

export function QuestionForm({ categories, initialData, isEditing, questionId }: QuestionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState(initialData?.questionText ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [options, setOptions] = useState<string[]>(initialData?.options ?? ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer ?? 0);
  const [explanation, setExplanation] = useState(initialData?.explanation ?? '');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty ?? 'medium');
  const [source, setSource] = useState(initialData?.source ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [isUploading, setIsUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.data.url);
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage() {
    setImageUrl('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (options.some((o) => !o.trim())) {
      setError('All options must be filled');
      setIsSubmitting(false);
      return;
    }

    if (new Set(options.map((o) => o.toLowerCase().trim())).size !== options.length) {
      setError('All options must be unique');
      setIsSubmitting(false);
      return;
    }

    const body = {
      questionText,
      category,
      options,
      correctAnswer,
      explanation,
      difficulty,
      source,
      imageUrl: imageUrl || undefined,
    };

    try {
      const url = isEditing && questionId
        ? `/api/admin/questions/${questionId}`
        : '/api/admin/questions';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to save question');
        return;
      }

      router.push('/admin/questions');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="questionText">Question Text</Label>
        <textarea
          id="questionText"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Image (optional)</Label>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Choose Image'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
          </label>
          {imageUrl && (
            <button type="button" onClick={removeImage} className="text-sm text-destructive hover:underline">
              <X className="h-4 w-4 inline" /> Remove
            </button>
          )}
        </div>
        {imageUrl && (
          <div className="mt-2 rounded-md border overflow-hidden max-w-xs">
            <img src={imageUrl} alt="Question image" className="w-full h-auto" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="radio"
              name="correctAnswer"
              checked={correctAnswer === index}
              onChange={() => setCorrectAnswer(index)}
              className="h-4 w-4 shrink-0"
              title={`Mark as correct answer`}
            />
            <div className="flex-1">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
            {correctAnswer === index && (
              <span className="text-xs text-green-600 font-medium shrink-0">Correct</span>
            )}
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation</Label>
        <textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. Palestinian Exam 2010-2011"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditing ? 'Update Question' : 'Create Question'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
