import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/features/landing/Header';

const inter = Inter({ subsets: ['latin'] });

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
