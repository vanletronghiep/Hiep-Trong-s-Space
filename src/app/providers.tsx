'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from '@/client/query-provider';
import { TransitionProvider } from '@/features/transitions/TransitionProvider';
import { ToastProvider } from '@/ui/Toast';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <TransitionProvider>{children}</TransitionProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
