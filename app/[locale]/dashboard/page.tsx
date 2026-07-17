import Link from 'next/link';
import { BookOpen, HelpCircle, BarChart3, FileEdit, Bookmark, GraduationCap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: 'dashboard.main' });

  const quickLinks = [
    { href: '/articles', label: t('links.articles.label'), description: t('links.articles.description'), icon: BookOpen },
    { href: '/dashboard/practice', label: t('links.practice.label'), description: t('links.practice.description'), icon: HelpCircle },
    { href: '/dashboard/progress', label: t('links.progress.label'), description: t('links.progress.description'), icon: BarChart3 },
    { href: '/dashboard/contributions', label: t('links.contributions.label'), description: t('links.contributions.description'), icon: FileEdit },
    { href: '/dashboard/bookmarks', label: t('links.bookmarks.label'), description: t('links.bookmarks.description'), icon: Bookmark },
    { href: '/workshops', label: t('links.workshops.label'), description: t('links.workshops.description'), icon: GraduationCap },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold">{t('gettingStarted')}</h2>
        <p className="text-muted-foreground mt-1">
          {t('welcome')}{session?.user?.name ? `, ${session.user.name}` : ''}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-lg border p-6 hover:border-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {link.label}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
