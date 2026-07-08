'use client';

import * as React from 'react';
import { useToast } from './hooks/use-toast';
import { Toaster } from './ui/toaster';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

export function Providers({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  return (
    <SessionProvider session={session} refetchInterval={0}>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
