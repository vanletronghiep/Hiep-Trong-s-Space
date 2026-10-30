'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export interface TransitionContextValue {
  isTransitioning: boolean;
  navigate: (href: string, options?: { replace?: boolean }) => void;
  signalPageReady: (pathname: string) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [router],
  );

  const signalPageReady = useCallback((_pathname: string) => {
    void _pathname;
  }, []);

  const value = useMemo<TransitionContextValue>(
    () => ({
      isTransitioning: false,
      navigate,
      signalPageReady,
    }),
    [navigate, signalPageReady],
  );

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}

export function useTransitionRouter(): {
  push: (href: string) => void;
  replace: (href: string) => void;
  isTransitioning: boolean;
} {
  const ctx = useContext(TransitionContext);
  const fallbackRouter = useRouter();

  const push = useCallback(
    (href: string) => {
      if (ctx) {
        ctx.navigate(href);
      } else {
        fallbackRouter.push(href);
      }
    },
    [ctx, fallbackRouter],
  );

  const replace = useCallback(
    (href: string) => {
      if (ctx) {
        ctx.navigate(href, { replace: true });
      } else {
        fallbackRouter.replace(href);
      }
    },
    [ctx, fallbackRouter],
  );

  return {
    push,
    replace,
    isTransitioning: ctx?.isTransitioning ?? false,
  };
}

export function usePageReady(ready: boolean = true): void {
  const ctx = useContext(TransitionContext);
  const pathname = usePathname();

  useEffect(() => {
    if (ready && ctx && pathname) {
      ctx.signalPageReady(pathname);
    }
  }, [ready, ctx, pathname]);
}

export function PageReady({ ready = true }: { ready?: boolean }) {
  usePageReady(ready);
  return null;
}
