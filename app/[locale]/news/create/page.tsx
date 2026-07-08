import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { UserNewsForm } from '@/components/features/news/UserNewsForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  return {
    title: `${t('submitNews', { fallback: 'Submit News' })} | PhysioAI`,
    description: t('submitNewsDesc', { fallback: 'Submit an article or news to PhysioAI.' }),
  };
}

export default async function SubmitNewsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('submitNews', { fallback: 'Submit News' })}</h1>
        <p className="text-muted-foreground">
          {t('submitNewsDesc', { fallback: 'Share your news, articles, or updates with the community. All submissions require admin approval before being published.' })}
        </p>
      </div>
      
      <UserNewsForm />
    </div>
  );
}
