'use client';

import * as React from 'react';
import { useToast } from './hooks/use-toast';
import { Toaster } from './ui/toaster';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { Session } from 'next-auth';

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider session={session} refetchInterval={0}>
        {children}
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  );
}
