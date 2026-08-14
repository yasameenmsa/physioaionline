import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';
import { ArrowLeft, ArrowRight, Briefcase, Calendar, MapPin, ExternalLink, Mail } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const typeLabels: Record<string, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  remote: 'Remote',
  contract: 'Contract',
  internship: 'Internship',
};

const typeLabelsAr: Record<string, string> = {
  'full-time': 'دوام كامل',
  'part-time': 'دوام جزئي',
  remote: 'عن بُعد',
  contract: 'عقد',
  internship: 'تدريب',
};

export default async function JobDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'jobs.detail' });
  await connectDB();

  const job = await Job.findOne({ slug, published: true })
    .populate('author', 'name')
    .lean();

  if (!job) notFound();

  await Job.updateOne({ slug }, { $inc: { viewCount: 1 } });

  const j = job as any;
  const isAr = locale === 'ar';
  const typeLabel = isAr ? typeLabelsAr[j.type] : typeLabels[j.type];
  const date = j.publishedAt
    ? new Date(j.publishedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          {t('back')}
        </Link>

        <div className="mt-6 rounded-lg border bg-card p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              {j.logoUrl ? (
                <img
                  src={j.logoUrl}
                  alt={j.company}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : j.imageUrl ? (
                <img
                  src={j.imageUrl}
                  alt={j.company}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{j.title}</h1>
                <p className="text-muted-foreground mt-1">{j.company}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1.5 rounded-full bg-muted text-muted-foreground">
              {typeLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-muted-foreground">
            {j.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {j.location}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
            )}
          </div>

          {j.tags && j.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {j.tags.map((tg: string) => (
                <span
                  key={tg}
                  className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                >
                  {tg}
                </span>
              ))}
            </div>
          )}

          <div className="prose max-w-none mt-6 whitespace-pre-wrap">{j.description}</div>

          {j.imageUrl && j.logoUrl && (
            <div className="mt-6 rounded-lg border overflow-hidden mx-auto max-w-3xl">
              <img
                src={j.imageUrl}
                alt={j.company}
                className="w-full object-contain max-h-[55vh] bg-muted"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
            {j.applyUrl && (
              <a
                href={j.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:bg-primary/90"
              >
                {t('apply')}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {j.contactEmail && (
              <a
                href={`mailto:${j.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-md border text-sm font-medium px-4 py-2 hover:bg-muted"
              >
                <Mail className="h-4 w-4" />
                {t('contact')}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
