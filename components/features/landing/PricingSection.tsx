'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function PricingSection() {
  const t = useTranslations('landing.pricing');

  const tiers = [
    {
      nameKey: 'free.name',
      priceKey: 'free.price',
      periodKey: 'free.period',
      descKey: 'free.description',
      featuresKey: 'free.features',
      ctaKey: 'free.cta',
      highlighted: false,
    },
    {
      nameKey: 'premium.name',
      priceKey: 'premium.price',
      periodKey: 'premium.period',
      descKey: 'premium.description',
      featuresKey: 'premium.features',
      ctaKey: 'premium.cta',
      highlighted: true,
    },
    {
      nameKey: 'pro.name',
      priceKey: 'pro.price',
      periodKey: 'pro.period',
      descKey: 'pro.description',
      featuresKey: 'pro.features',
      ctaKey: 'pro.cta',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{t('title')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => {
              const features = t.raw(tier.featuresKey) as string[];
              return (
                <PricingCard
                  key={tier.nameKey}
                  name={t(tier.nameKey)}
                  price={t(tier.priceKey)}
                  period={t(tier.periodKey)}
                  description={t(tier.descKey)}
                  features={features}
                  cta={t(tier.ctaKey)}
                  highlighted={tier.highlighted}
                />
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t('footer')}
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
  const t = useTranslations('landing.pricing');

  return (
    <Card className={`relative ${highlighted ? 'border-primary-500 shadow-lg scale-105' : ''}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
            {t('mostPopular')}
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
              <Check className="me-2 h-5 w-5 shrink-0 text-primary-500" />
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
