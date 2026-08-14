import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Job from '@/models/Job';
import { AdminJobForm } from '../../AdminJobForm';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function AdminEditJobPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.jobs' });

  await connectDB();

  const job = await Job.findOne({ slug }).lean();
  if (!job) notFound();

  const j = job as any;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('editTitle') || 'Edit Job'}</h2>
      <AdminJobForm
        initialData={{
          slug: j.slug,
          title: j.title,
          company: j.company,
          location: j.location || '',
          type: j.type || 'full-time',
          description: j.description,
          excerpt: j.excerpt || '',
          imageUrl: j.imageUrl || '',
          applyUrl: j.applyUrl || '',
          contactEmail: j.contactEmail || '',
          tags: j.tags || [],
          published: j.published || false,
        }}
      />
    </div>
  );
}
