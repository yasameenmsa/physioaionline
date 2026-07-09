import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BookOpen, Bookmark, FileEdit, Library, HelpCircle, BarChart3, Settings, Ticket, User, GraduationCap, Rss } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  const navItems = [
    { href: '/articles', label: t('nav.knowledgeBase'), icon: Library },
    { href: '/dashboard/practice', label: t('nav.practice'), icon: HelpCircle },
    { href: '/dashboard/progress', label: t('nav.progress'), icon: BarChart3 },
    { href: '/dashboard/contributions', label: t('nav.myArticles'), icon: FileEdit },
    { href: '/dashboard/bookmarks', label: t('nav.bookmarks'), icon: Bookmark },
  ];

  const bottomNavItems = [
    { href: '/dashboard/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcomeBack', { name: String(session.user.name ?? session.user.email ?? '') })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          <aside className="lg:col-span-1">
            <nav className="lg:sticky lg:top-24 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {session.user.role === 'admin' && (
                <>
                  <div className="pt-4 pb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      {t('nav.admin')}
                    </p>
                  </div>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    href="/admin/courses"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <GraduationCap className="h-4 w-4" />
                    {t('nav.courses')}
                  </Link>
                  <Link
                    href="/admin/news"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Rss className="h-4 w-4" />
                    {t('nav.news')}
                  </Link>
                  <Link
                    href="/admin/questions"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    {t('nav.questions')}
                  </Link>
                  <Link
                    href="/admin/review"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t('nav.reviewQueue')}
                  </Link>
                  <Link
                    href="/admin/codes"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <Ticket className="h-4 w-4" />
                    {t('nav.codes')}
                  </Link>
                </>
              )}
              <div className="pt-4 border-t mt-4">
                {bottomNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          <main className="lg:col-span-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
