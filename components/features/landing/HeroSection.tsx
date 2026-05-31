'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, BookOpen, Target, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background">
      <div className="container mx-auto px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700">
            <Target className="mr-2 h-4 w-4" />
            Palestinian Physiotherapy License Exam Prep
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Pass Your Physiotherapy Exam with{' '}
            <span className="text-primary-500">AI-Powered</span> Practice
          </h1>

          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Master the Palestinian Physiotherapy Association licensing exam with our intelligent
            question bank. Get instant feedback, detailed explanations, and track your progress
            with personalized analytics.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Practicing Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#sample-questions">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Try Sample Questions
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-primary-500" />}
              title="77+ Practice Questions"
              description="Real exam questions from past Palestinian licensing exams"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary-500" />}
              title="Track Progress"
              description="Monitor your improvement with detailed analytics"
            />
            <FeatureCard
              icon={<Target className="h-6 w-6 text-primary-500" />}
              title="Instant Feedback"
              description="Learn from detailed explanations for every answer"
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
