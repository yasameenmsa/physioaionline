import type { Metadata } from 'next';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
