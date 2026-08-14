import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Job from '@/models/Job';
import { Eye, Calendar, Pencil, Trash2, MapPin, Plus } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { PublishJobButton } from './PublishJobButton';
import { DeleteJobButton } from './DeleteJobButton';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
  params: Promise<{ locale: string }>;
}

const typeLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  remote: 'Remote',
  contract: 'Contract',
  internship: 'Internship',
};

export default async function AdminJobsPage({ searchParams, params }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') redirect('/login');

  const { locale } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 20;
  const skip = (currentPage - 1) * limit;
  const t = await getTranslations({ locale, namespace: 'admin.jobs' });

  await connectDB();

  const [jobs, total] = await Promise.all([
    Job.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">{total} {t('total')}</p>
        </div>
        <Link
          href="/admin/jobs/create"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          {t('create')}
        </Link>
      </div>

      <div className="rounded-lg border">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground p-6 text-center">{t('noJobs')}</p>
        ) : (
          <div className="divide-y">
            {jobs.map((job) => (
              <div key={job._id.toString()} className="flex items-center justify-between p-4 text-sm">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{job.title}</p>
                    {!job.published && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-1.5 py-0.5 rounded">{t('draft')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="truncate">{job.company}</span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                    <span>{typeLabels[job.type] || job.type}</span>
                    {job.author && <span>{(job.author as any).name}</span>}
                    {job.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(job.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {job.viewCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PublishJobButton slug={job.slug} currentlyPublished={job.published} />
                  <Link href={`/jobs/${job.slug}`} className="text-xs text-primary hover:underline">
                    {t('view')}
                  </Link>
                  <Link
                    href={`/admin/jobs/${job.slug}/edit`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                    {t('edit')}
                  </Link>
                  <DeleteJobButton slug={job.slug} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link href={`/admin/jobs?page=${currentPage - 1}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('previous')}
            </Link>
          )}
          <span className="text-sm text-muted-foreground">{t('page')} {currentPage} {t('of')} {totalPages}</span>
          {currentPage < totalPages && (
            <Link href={`/admin/jobs?page=${currentPage + 1}`} className="px-3 py-1.5 text-sm rounded border hover:bg-muted">
              {t('next')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
