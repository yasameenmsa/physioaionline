'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ChevronLeft, ChevronRight, GraduationCap, Filter } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  category: Category;
  difficulty?: string;
  source?: string;
}

interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('questions.list');

  const difficulties = [
    { value: '', label: t('allDifficulties') },
    { value: 'easy', label: t('easy') },
    { value: 'medium', label: t('medium') },
    { value: 'hard', label: t('hard') },
  ];

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);

    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setQuestions(d.data.questions);
          setTotal(d.data.total);
          setTotalPages(d.data.totalPages);
        }
        setLoading(false);
      });
  }, [page, category, difficulty]);

  function handleFilterChange(resetPage = true) {
    if (resetPage) setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary mb-4">
              <GraduationCap className="h-6 w-6" />
              <span className="text-sm font-medium uppercase tracking-wider">{t('badge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('description', { total })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-muted/30 rounded-lg">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); handleFilterChange(); }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {difficulties.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <div className="text-sm text-muted-foreground ml-auto">
              {t('count', { count: total })}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-lg border p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 border rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noQuestions')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('adjustFilters')}
              </p>
              <Button variant="outline" onClick={() => { setCategory(''); setDifficulty(''); setPage(1); }}>
                {t('clearFilters')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <Card key={q._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-medium text-muted-foreground shrink-0 mt-0.5">
                        {(page - 1) * 20 + i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-3">{q.questionText}</p>
                        <div className="space-y-1.5 mb-3">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded hover:bg-muted/50"
                            >
                              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium shrink-0">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {q.category && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                              {q.category.name}
                            </span>
                          )}
                          {q.difficulty && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {q.difficulty}
                            </span>
                          )}
                          {q.source && <span>{q.source}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4 me-1" />
                {t('previous')}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                {t('next')}
                <ChevronRight className="h-4 w-4 ms-1" />
              </Button>
            </div>
          )}

          <div className="mt-12 text-center p-8 bg-muted/30 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">{t('cta.title')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('cta.description')}
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/practice">
                {t('cta.button')}
                <GraduationCap className="h-4 w-4 ms-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
