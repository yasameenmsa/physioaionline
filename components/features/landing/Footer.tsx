'use client';

import { Link } from '@/i18n/routing';
import { Mail, Linkedin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const footerLinks: Record<string, { labelKey: string; href: string }[]> = {
  forStudents: [
    { labelKey: 'footer.questions', href: '/sample-questions' },
    { labelKey: 'footer.knowledgeBase', href: '/articles' },
    { labelKey: 'footer.pricing', href: '#pricing' },
  ],
  forProfessionals: [
    { labelKey: 'footer.courses', href: '/courses' },
    { labelKey: 'footer.features', href: '#features' },
    { labelKey: 'footer.news', href: '/news' },
  ],
};

const socialLinks = [
  { icon: XIcon, href: '#', labelKey: 'social.x' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/yasmin-msa', labelKey: 'social.linkedin' },
  { icon: Mail, href: 'mailto:yasmeenawawdehm@gmail.com', labelKey: 'social.email' },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations('landing.footer');
  const tl = useTranslations('landing.footer.links');
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-500">PhysioAI</h3>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {footerLinks.forStudents.length > 0 && (
            <div>
              <h4 className="mb-4 font-semibold">{t('forStudents')}</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.forStudents.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {tl(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {footerLinks.forProfessionals.length > 0 && (
            <div>
              <h4 className="mb-4 font-semibold">{t('forProfessionals')}</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.forProfessionals.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {tl(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {year} PhysioAI.online. {t('madeWith')}{' '}
            <span className="text-red-500">&hearts;</span> {t('by')}{' '}
            <a
              href="https://tar-tech.my.canva.site/yasmin-msa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Yasmin Awawdeh
            </a>
            . {t('rights')}
          </p>

          <div className="mt-4 flex gap-4 sm:mt-0">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={tl(link.labelKey)}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
