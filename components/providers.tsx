'use client';

import * as React from 'react';
import { useToast } from './hooks/use-toast';
import { Toaster } from './ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}

import { SessionProvider } from 'next-auth/react';
