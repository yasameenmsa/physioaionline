import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import News from '@/models/News';
import { AdminNewsForm } from '../../AdminNewsForm';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function AdminEditNewsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin.news' });

  await connectDB();

  const newsItem = await News.findOne({ slug }).lean();
  if (!newsItem) notFound();

  const item = newsItem as any;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t('editTitle') || 'Edit News'}</h2>
      <AdminNewsForm
        initialData={{
          slug: item.slug,
          title: item.title,
          content: item.content,
          excerpt: item.excerpt || '',
          imageUrl: item.imageUrl || '',
          tags: item.tags || [],
          published: item.published || false,
        }}
      />
    </div>
  );
}
