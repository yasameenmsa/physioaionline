import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/features/landing/Header';
import { LocaleDir } from '@/components/LocaleDir';
import { auth } from '@/lib/auth';
import { routing } from '@/i18n/routing';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'فيزيـو إيـه آي أونـلايـن' : 'PhysioAI.online',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const session = await auth();
  const fontClass = locale === 'ar' ? notoSansArabic.variable : inter.variable;

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers session={session}>
        <LocaleDir>
          <div className={`${fontClass} flex flex-col h-screen overflow-hidden`}>
            <Header />
            <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
          </div>
        </LocaleDir>
      </Providers>
    </NextIntlClientProvider>
  );
}
