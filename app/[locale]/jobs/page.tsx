import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import Job from '@/models/Job';
import { Briefcase, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}

const typeLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  remote: 'Remote',
  contract: 'Contract',
  internship: 'Internship',
};

export default async function JobsPage({ searchParams, params }: PageProps) {
  const { tag, page: pageStr } = await searchParams;
  const { locale } = await params;
  const currentPage = Math.max(1, parseInt(pageStr ?? '1'));
  const limit = 12;
  const skip = (currentPage - 1) * limit;
  const t = await getTranslations({ locale, namespace: 'jobs.list' });
  const session = await auth();

  await connectDB();

  const filter: Record<string, unknown> = { published: true };
  if (tag) filter.tags = { $in: [tag] };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  const allTags = await Job.distinct('tags', {
    published: true,
    tags: { $ne: '', $exists: true },
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          </div>
          {session?.user && (
            <Link
              href="/jobs/create"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            >
              {t('postJob')}
            </Link>
          )}
        </div>
        <p className="text-muted-foreground mb-8">{t('description')}</p>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/jobs"
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t('all')}
            </Link>
            {allTags.map((tg) => (
              <Link
                key={tg}
                href={`/jobs?tag=${encodeURIComponent(tg)}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  tag === tg
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tg}
              </Link>
            ))}
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t('noJobs')}</h2>
            <p className="text-muted-foreground mt-2">{t('noJobsDesc')}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const j = job as any;
                const label =
                  locale === 'ar'
                    ? ({
                        'full-time': 'دوام كامل',
                        'part-time': 'دوام جزئي',
                        remote: 'عن بُعد',
                        contract: 'عقد',
                        internship: 'تدريب',
                      } as Record<string, string>)[j.type] || typeLabels[j.type]
                    : typeLabels[j.type];
                return (
                  <Link
                    key={j._id.toString()}
                    href={`/jobs/${j.slug}`}
                    className="group rounded-lg border bg-card p-6 shadow-sm transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {(j.logoUrl || j.imageUrl) && (
                            <img
                              src={j.logoUrl || j.imageUrl}
                              alt={j.company}
                              className="h-9 w-9 rounded-md object-cover shrink-0"
                            />
                          )}
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {j.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{j.company}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                      {j.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{j.location}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {j.excerpt || j.title}
                    </p>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/jobs?page=${currentPage - 1}${tag ? `&tag=${tag}` : ''}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md border hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('previous')}
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  {t('page')} {currentPage} {t('of')} {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/jobs?page=${currentPage + 1}${tag ? `&tag=${tag}` : ''}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-md border hover:bg-muted"
                  >
                    {t('next')}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
