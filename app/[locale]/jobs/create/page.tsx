import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { UserJobForm } from '@/components/features/jobs/UserJobForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'jobs' });
  return {
    title: `${t('submitJob', { fallback: 'Post a Job' })} | PhysioAI`,
    description: t('submitJobDesc', { fallback: 'Post a physiotherapy job listing on PhysioAI.' }),
  };
}

export default async function CreateJobPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'jobs' });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('submitJob', { fallback: 'Post a Job' })}</h1>
        <p className="text-muted-foreground">
          {t('submitJobDesc', { fallback: 'Share a physiotherapy job opening with the community. Listings require admin approval before being published.' })}
        </p>
      </div>

      <UserJobForm />
    </div>
  );
}
