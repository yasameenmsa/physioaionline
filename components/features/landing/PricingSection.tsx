'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 practice questions per day',
      'Basic progress tracking',
      'Access to free sample questions',
      'Community support'
    ],
    cta: 'Start Free',
    highlighted: false
  },
  {
    name: 'Premium',
    price: '$9',
    period: '/month',
    description: 'Best for serious students',
    features: [
      'Unlimited practice questions',
      'Detailed performance analytics',
      'Progress tracking by category',
      'Email support',
      'Ad-free experience'
    ],
    cta: 'Get Premium',
    highlighted: true
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Maximum exam preparation',
    features: [
      'Everything in Premium',
      'Advanced analytics & insights',
      'Custom practice exams',
      'Priority support',
      'Early access to new questions',
      'Exam simulation mode'
    ],
    cta: 'Get Pro',
    highlighted: false
  }
];

export function PricingSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your study needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <PricingCard key={tier.name} {...tier} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include access to our core question bank. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

function PricingCard({ name, price, period, description, features, cta, highlighted }: PricingCardProps) {
  return (
    <Card className={`relative ${highlighted ? 'border-primary-500 shadow-lg scale-105' : ''}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="mb-6 space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-start">
              <Check className="mr-2 h-5 w-5 shrink-0 text-primary-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
        >
          <Link href="/register">{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
