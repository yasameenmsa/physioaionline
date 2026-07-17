'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export function LocaleDir({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', locale);
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
  }, [locale]);

  return <>{children}</>;
}
