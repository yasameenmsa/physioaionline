import { HeroSection } from '@/components/features/landing/HeroSection';
import { SampleQuestions } from '@/components/features/landing/SampleQuestions';
import { WaitlistForm } from '@/components/forms/WaitlistForm';
import { PricingSection } from '@/components/features/landing/PricingSection';
import { Footer } from '@/components/features/landing/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

export default function HomePage() {
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
                Evidence-Based Knowledge Base
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Browse our growing collection of evidence-based physiotherapy articles, 
                clinical guides, and rehabilitation protocols written by professionals.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link href="/articles">
                  <Button size="lg">
                    Browse Knowledge Base
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
                Join Our Waitlist
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Be the first to know when we launch and get exclusive early access
                discounts.
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
