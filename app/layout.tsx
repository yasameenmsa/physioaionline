import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'PhysioAI.online - Physiotherapy Knowledge Base & Exam Prep',
  description:
    'Free evidence-based physiotherapy knowledge base, articles, and exam preparation resources for students and professionals.',
  keywords: [
    'physiotherapy',
    'physical therapy',
    'knowledge base',
    'NPTE',
    'licensing exam',
    'exam preparation',
    'rehabilitation',
    'evidence-based practice',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
