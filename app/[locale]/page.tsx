import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/features/landing/HeroSection';
import { SampleQuestions } from '@/components/features/landing/SampleQuestions';
import { PricingSection } from '@/components/features/landing/PricingSection';
import { Footer } from '@/components/features/landing/Footer';
import { WaitlistForm } from '@/components/forms/WaitlistForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  return (
    <>
      <main>
        <HeroSection />

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('knowledgeBase.title')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('knowledgeBase.description')}
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/articles">
                  <Button size="lg">
                    {t('knowledgeBase.cta')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SampleQuestions />
        <PricingSection />
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t('waitlist.title')}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t('waitlist.description')}
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-md">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
