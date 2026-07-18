import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LayoutDashboard, HelpCircle, BookOpen, ChevronLeft, GraduationCap, Rss, ScrollText, FileText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  const navItems = [
    { href: '/admin', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/admin/questions', label: t('nav.questions'), icon: HelpCircle },
    { href: '/admin/articles', label: t('nav.articles'), icon: FileText },
    { href: '/admin/review', label: t('nav.review'), icon: BookOpen },
    { href: '/admin/news', label: t('nav.news'), icon: Rss },
    { href: '/admin/courses', label: t('nav.courses'), icon: GraduationCap },
    { href: '/admin/workshops', label: t('nav.workshops'), icon: BookOpen },
    { href: '/admin/prompts', label: t('nav.prompts'), icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('backToDashboard')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          <aside className="lg:col-span-1">
            <nav className="lg:sticky lg:top-24 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Admin
              </p>
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
            </nav>
          </aside>

          <main className="lg:col-span-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
