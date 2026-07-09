'use client';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: {
    name: string;
  };
}

export function SampleQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('landing.sampleQuestions');

  useEffect(() => {
    fetch('/api/questions/sample?limit=5')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setQuestions(json.data);
        }
      })
      .catch(() => {
        setQuestions(getFallbackQuestions());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="sample-questions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="h-8 w-32 animate-pulse bg-muted rounded mx-auto mb-4" />
            <div className="h-4 w-64 animate-pulse bg-muted rounded mx-auto mb-12" />
            <Card>
              <CardContent className="p-8">
                <div className="h-6 w-3/4 animate-pulse bg-muted rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const items = questions;

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const currentQuestion = items[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  return (
    <section id="sample-questions" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('title')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>
                  {t('category')}: {currentQuestion.category.name}
                </CardDescription>
                <CardDescription>
                  {t('question')} {currentIndex + 1} {t('of')} {questions.length}
                </CardDescription>
              </div>
              <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctAnswer;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                      className={`
                        w-full rounded-lg border p-4 text-left transition-all
                        ${
                          showExplanation && isCorrectAnswer
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : showExplanation && isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50 text-red-900'
                            : isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-border bg-card hover:bg-muted'
                        }
                        ${showExplanation ? 'cursor-default' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">
                          <span className="font-semibold me-2">{String.fromCharCode(65 + index)}.</span>
                          {option}
                        </span>
                        {showExplanation && isCorrectAnswer && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {showExplanation && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <Alert className={`${isCorrect ? 'border-green-500' : 'border-red-500'} mt-6`}>
                  <AlertDescription>
                    <p className="font-semibold mb-2">
                      {isCorrect ? t('correct') : t('incorrect')}
                    </p>
                    <p className="text-sm">{currentQuestion.explanation}</p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="me-2 h-4 w-4" />
                  {t('previous', { default: 'Previous' })}
                </Button>
                <Button onClick={handleNext} disabled={currentIndex === questions.length - 1}>
                  {t('next', { default: 'Next' })}
                  <ChevronRight className="ms-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('prompt')}
            </p>
            <Button asChild>
              <Link href="/register">{t('cta')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function getFallbackQuestions(): Question[] {
  return [
    {
      _id: '1',
      questionText: 'A complete medical history should be conducted how often?',
      options: [
        'Every visit',
        'Only on the first visit',
        'Every 6 months',
        'Every year'
      ],
      correctAnswer: 0,
      explanation: 'A complete medical history should be conducted every visit to ensure any changes in the patient\'s condition are noted.',
      category: { name: 'Clinical Practice' }
    },
    {
      _id: '2',
      questionText: 'Which of the following is NOT a vital sign?',
      options: [
        'Blood pressure',
        'Heart rate',
        'Pain level',
        'Hair color'
      ],
      correctAnswer: 3,
      explanation: 'Hair color is not a vital sign. The main vital signs are blood pressure, heart rate, respiratory rate, temperature, and pain level.',
      category: { name: 'Assessment' }
    }
  ];
}
