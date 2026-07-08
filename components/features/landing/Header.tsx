'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, LayoutDashboard, User, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

function UserDropdown({ name, email }: { name?: string | null; email?: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations('header');
  const initial = (name || email || 'U').charAt(0).toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {initial}
        </span>
        <span className="hidden sm:inline max-w-[120px] truncate">{name || email}</span>
      </button>

      {open && (
        <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 rounded-lg border bg-popover p-1 shadow-lg z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b mb-1 truncate">
            {email}
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('dashboard')}
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            {t('profile')}
          </Link>
          <button
            type="button"
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'ar' : 'en';
  const label = locale === 'en' ? 'العربية' : 'English';

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-transparent hover:border-border"
    >
      <Globe className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const t = useTranslations('header');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 ltr:space-x-2 rtl:space-x-reverse">
          {locale === 'ar' ? (
            <span className="text-xl font-bold text-primary-600 whitespace-nowrap">فيزيـو إيـه آي أونـلايـن</span>
          ) : (
            <>
              <span className="text-xl font-bold text-primary-600">PhysioAI</span>
              <span className="text-xl font-light text-foreground">.online</span>
            </>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link href="/courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.courses')}
          </Link>
          <Link href="/news" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.news')}
          </Link>
          <Link href="/articles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.knowledgeBase')}
          </Link>
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.features')}
          </Link>
          <Link href="/#sample-questions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.sampleQuestions')}
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.pricing')}
          </Link>
        </nav>

        <div className="hidden md:flex md:items-center md:gap-2">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <UserDropdown name={session.user.name} email={session.user.email} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  {t('signup')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">{t('openMenu')}</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto space-y-1 px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/courses"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.courses')}
            </Link>
            <Link
              href="/news"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.news')}
            </Link>
            <Link
              href="/articles"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.knowledgeBase')}
            </Link>
            <Link
              href="/#features"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.features')}
            </Link>
            <Link
              href="/#sample-questions"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.sampleQuestions')}
            </Link>
            <Link
              href="/#pricing"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.pricing')}
            </Link>
            <div className="pt-4 flex flex-col gap-2">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {(session.user.name || session.user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{session.user.name || session.user.email}</span>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <LayoutDashboard className="h-4 w-4 me-2" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive"
                    size="sm"
                    onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  >
                    <LogOut className="h-4 w-4 me-2" />
                    {t('signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      {t('signup')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
