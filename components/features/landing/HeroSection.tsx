'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, BookOpen, Target, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background">
      <div className="container mx-auto px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700">
            <Target className="me-2 h-4 w-4" />
            {t('badge')}
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            {t('title')}{' '}
            <span className="text-primary-500">{t('titleHighlight')}</span>{' '}
            {t('titleSuffix')}
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            {t('description')}
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                {t('ctaStart')}
                <ArrowRight className="ms-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#sample-questions">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <BookOpen className="me-2 h-5 w-5" />
                {t('ctaSamples')}
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-primary-500" />}
              title={t('featureQuestions')}
              description={t('featureQuestionsDesc')}
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary-500" />}
              title={t('featureProgress')}
              description={t('featureProgressDesc')}
            />
            <FeatureCard
              icon={<Target className="h-6 w-6 text-primary-500" />}
              title={t('featureFeedback')}
              description={t('featureFeedbackDesc')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
