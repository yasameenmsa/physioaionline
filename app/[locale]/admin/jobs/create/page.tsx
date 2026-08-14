import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { AdminJobForm } from '../AdminJobForm';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminCreateJobPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.jobs' });

  await connectDB();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('createTitle')}</h2>
      <AdminJobForm />
    </div>
  );
}
