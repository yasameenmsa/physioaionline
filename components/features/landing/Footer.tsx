'use client';

import Link from 'next/link';
import { Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

const footerLinks: Record<string, { labelKey: string; href: string }[]> = {
  product: [
    { labelKey: 'footer.questions', href: '/questions' },
    { labelKey: 'footer.knowledgeBase', href: '/articles' },
    { labelKey: 'footer.courses', href: '/courses' },
    { labelKey: 'footer.pricing', href: '#pricing' },
    { labelKey: 'footer.features', href: '#features' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', labelKey: 'social.facebook' },
  { icon: Twitter, href: '#', labelKey: 'social.twitter' },
  { icon: Linkedin, href: '#', labelKey: 'social.linkedin' },
  { icon: Mail, href: 'mailto:info@physioai.online', labelKey: 'social.email' },
];

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

          {footerLinks.product.length > 0 && (
            <div>
              <h4 className="mb-4 font-semibold">{t('product')}</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.product.map((link) => (
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

          {footerLinks.company.length > 0 && (
            <div>
              <h4 className="mb-4 font-semibold">{t('company')}</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.company.map((link) => (
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

          {footerLinks.legal.length > 0 && (
            <div>
              <h4 className="mb-4 font-semibold">{t('legal')}</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.legal.map((link) => (
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
