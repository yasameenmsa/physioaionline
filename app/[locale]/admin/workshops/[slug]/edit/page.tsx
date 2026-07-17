import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Workshop from '@/models/Workshop';
import { WorkshopForm } from '@/components/features/workshops/WorkshopForm';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function AdminEditWorkshopPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.workshops' });

  await connectDB();

  const workshop = await Workshop.findOne({ slug }).lean();
  if (!workshop) notFound();

  const w = workshop as any;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('editTitle')}</h2>
      <WorkshopForm
        initialData={{
          slug: w.slug,
          title: w.title,
          description: w.description || '',
          image: w.image || '',
          price: w.price || 0,
          category: w.category || '',
          level: w.level || 'beginner',
          language: w.language || 'en',
          tags: w.tags || [],
          whatYouLearn: w.whatYouLearn || [],
          requirements: w.requirements || [],
          published: w.published || false,
        }}
      />
    </div>
  );
}
