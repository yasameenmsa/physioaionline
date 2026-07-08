'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  HelpCircle,
  BarChart3,
  Ticket,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

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

interface AnswerResult {
  correct: boolean;
  correctAnswer: number;
  explanation: string;
  dailyLimitReached?: boolean;
  categoryName?: string;
}

interface SessionResult {
  total: number;
  correct: number;
}

export default function PracticePage() {
  const { data: session, status } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [dailyLimit, setDailyLimit] = useState<{ remaining: number; limit: number; isPremium: boolean } | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult>({ total: 0, correct: 0 });
  const [sessionDone, setSessionDone] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemError, setRedeemError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {});

    fetch('/api/user/daily-limit')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setDailyLimit(json.data);
      })
      .catch(() => {});
  }, []);

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  const startPractice = async () => {
    setStarting(true);
    setSessionDone(false);
    setSessionResult({ total: 0, correct: 0 });
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResult(null);

    try {
      const params = new URLSearchParams({ limit: '10' });
      if (selectedCategory) params.set('category', selectedCategory);

      const res = await fetch(`/api/questions?${params}`);
      const json = await res.json();

      if (json.data?.questions?.length > 0) {
        setQuestions(json.data.questions);
        setQuizStarted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const handleAnswerSelect = async (index: number) => {
    if (submitting || answerResult) return;
    setSubmitting(true);
    setSelectedAnswer(index);

    try {
      const res = await fetch(`/api/questions/${questions[currentIndex]._id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: index }),
      });
      const json = await res.json();

      setAnswerResult(json.data);

      if (json.data && !json.data.dailyLimitReached) {
        const isCorrect = json.data.correct;
        setSessionResult((prev) => ({
          total: prev.total + 1,
          correct: prev.correct + (isCorrect ? 1 : 0),
        }));
      }

      if (json.data?.dailyLimitReached) {
        setSessionDone(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
    } else {
      setSessionDone(true);
      setQuizStarted(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setAnswerResult(null);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    setRedeemMessage('');
    setRedeemError('');
    try {
      const res = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode }),
      });
      const json = await res.json();
      if (json.data) {
        setRedeemMessage(json.data.message);
        setRedeemCode('');
        setDailyLimit((prev) => prev ? { ...prev, isPremium: true } : prev);
      } else {
        setRedeemError(json.error || 'Invalid code');
      }
    } catch {
      setRedeemError('Failed to redeem code');
    } finally {
      setRedeeming(false);
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setSessionDone(false);
    setSessionResult({ total: 0, correct: 0 });
    setSelectedCategory('');
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerResult(null);
  };

  if (status === 'loading') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (!sessionDone && (sessionResult.total > 0 || !quizStarted)) {
    // Show start screen or results
  }

  if (sessionDone && sessionResult.total > 0) {
    const accuracy = Math.round((sessionResult.correct / sessionResult.total) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
            <CardDescription>Here is your performance summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{sessionResult.total}</p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{sessionResult.correct}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>

            {dailyLimit?.remaining === 0 && !dailyLimit?.isPremium && (
              <Alert>
                <AlertDescription>
                  You have reached your daily limit. Upgrade to Premium for unlimited practice.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/progress">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Progress
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Practice Questions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Test your knowledge with physiotherapy exam questions
          </p>
        </div>

        {dailyLimit && !dailyLimit.isPremium && (
          <>
            <Card className="mb-6">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Daily limit: <strong>{dailyLimit.remaining}</strong> questions remaining
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Have a code?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm uppercase"
                    disabled={redeeming}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedeem}
                    disabled={redeeming || !redeemCode.trim()}
                  >
                    {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
                  </Button>
                </div>
                {redeemMessage && (
                  <p className="text-xs text-green-600 mt-2">{redeemMessage}</p>
                )}
                {redeemError && (
                  <p className="text-xs text-red-600 mt-2">{redeemError}</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Start a Practice Session</CardTitle>
            <CardDescription>
              Optionally select a category to focus on specific topics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category (optional)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card hover:bg-muted border-border'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedCategory === cat._id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card hover:bg-muted border-border'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={startPractice} disabled={starting} className="w-full">
              {starting ? 'Loading questions...' : 'Start Practice'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{currentQuestion.category?.name || 'General'}</span>
          <span>
            {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = answerResult && index === answerResult.correctAnswer;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={!!answerResult || submitting}
                  className={`
                    w-full rounded-lg border p-4 text-left transition-all
                    ${
                      answerResult && isCorrectAnswer
                        ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-400'
                        : answerResult && isSelected && !answerResult.correct
                        ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-400'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:bg-muted'
                    }
                    ${answerResult || submitting ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </span>
                    {answerResult && isCorrectAnswer && (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    )}
                    {answerResult && isSelected && !answerResult.correct && (
                      <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {answerResult && (
            <Alert
              className={`mt-6 ${
                answerResult.correct
                  ? 'border-green-500'
                  : answerResult.dailyLimitReached
                  ? 'border-yellow-500'
                  : 'border-red-500'
              }`}
            >
              <AlertDescription>
                {answerResult.dailyLimitReached ? (
                  <>
                    <p className="font-semibold mb-2">Daily limit reached</p>
                    <p className="text-sm">
                      You have used all your practice questions for today. Upgrade to Premium for unlimited practice.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-2">
                      {answerResult.correct ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p className="text-sm">{answerResult.explanation}</p>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {answerResult && !answerResult.dailyLimitReached && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="me-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="ms-2 h-4 w-4" />
                  </>
                ) : (
                  'See Results'
                )}
              </Button>
            </div>
          )}

          {answerResult?.dailyLimitReached && (
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link href="/pricing">Upgrade to Premium</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
