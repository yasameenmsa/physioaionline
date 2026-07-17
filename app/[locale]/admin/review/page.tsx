import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Article from '@/models/Article';
import User from '@/models/User';
import { AdminReviewItem } from './AdminReviewItem';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReviewQueuePage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const t = await getTranslations({ locale, namespace: 'admin.review' });

  const [pending, published, drafts] = await Promise.all([
    Article.find({ status: 'review' })
      .populate('category', 'name slug')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean(),
    Article.find({ status: 'published' })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean(),
    Article.find({ status: 'draft' })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t('description')}
      </p>

      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            {t('pendingReview')}
            <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 text-xs font-medium">
              {pending.length}
            </span>
          </h3>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg">
              {t('noPending')}
            </p>
          ) : (
            <div className="space-y-3">
              {(pending as any[]).map((a) => (
                <AdminReviewItem key={a._id.toString()} article={JSON.parse(JSON.stringify(a))} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('published', { count: published.length })}</h3>
          <div className="space-y-2">
            {(published as any[]).map((a) => (
              <div key={a._id.toString()} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div>
                  <a href={`/articles/${a.slug}`} className="font-medium hover:text-primary">
                    {a.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('submittedBy')} {(a.author as any)?.name} · {a.viewCount} {t('views')}
                  </p>
                </div>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full px-2 py-0.5">
                  {t('publishedBadge')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
