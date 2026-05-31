import { PricingSection } from '@/components/features/landing/PricingSection';
import { Footer } from '@/components/features/landing/Footer';

export const metadata = {
  title: 'Pricing - PhysioAI.online',
  description: 'Choose the right plan for your physiotherapy exam preparation journey.',
};

export default function PricingPage() {
  return (
    <>
      <PricingSection />
      <section className="py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Need a Custom Plan?</h2>
          <p className="text-muted-foreground mb-4">
            Contact{' '}
            <a href="mailto:yasmeenawawdehm@gmail.com" className="text-primary hover:underline font-medium">
              yasmeenawawdehm@gmail.com
            </a>{' '}
            for enterprise options or team subscriptions.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
