import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/features/landing/Header';
import { auth } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
