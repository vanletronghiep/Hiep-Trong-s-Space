'use client';

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useToast } from '@/ui/Toast';
import {
  CosmicLaunchOverlay,
  type CosmicLaunchPhase,
  type TransitionOverlayMode,
} from './CosmicLaunchOverlay';
import {
  normalizePathname,
  parseInternalHref,
  shouldTriggerCosmicLaunch,
} from './transition-rules';

const IGNITION_AT_MS = 500;
const ACCELERATION_AT_MS = 1300;
const ARRIVAL_GATE_MS = 2300;
const ARRIVAL_DURATION_MS = 700;
const FAILSAFE_REVEAL_MS = 10_000;
const QUICK_FADE_HOLD_MS = 120;
const QUICK_FADE_TOTAL_MS = 280;

export interface TransitionContextValue {
  isTransitioning: boolean;
  navigate: (href: string, options?: { replace?: boolean }) => void;
  signalPageReady: (pathname: string) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function lockDocumentScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.setAttribute('aria-busy', 'true');
}

function unlockDocumentScroll(): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.style.overflow = '';
  document.documentElement.removeAttribute('aria-busy');
}

function focusDestinationHeading(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const heading =
    document.querySelector<HTMLElement>('main h1') ??
    document.querySelector<HTMLElement>('h1') ??
    document.querySelector<HTMLElement>('main');

  if (!heading) {
    return;
  }

  const hadTabIndex = heading.hasAttribute('tabindex');
  if (!hadTabIndex) {
    heading.setAttribute('tabindex', '-1');
  }
  heading.focus({ preventScroll: true });
}

interface ActiveOverlayState {
  mode: TransitionOverlayMode;
  phase: CosmicLaunchPhase;
  fadingOutQuick: boolean;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const rawPathname = usePathname() ?? '/';
  const currentPathname = normalizePathname(rawPathname);
  const { pushToast } = useToast();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayState, setOverlayState] = useState<ActiveOverlayState | null>(null);

  const isTransitioningRef = useRef(false);
  const targetPathnameRef = useRef<string | null>(null);
  const readyPathnamesRef = useRef<Set<string>>(new Set());
  const gatePassedRef = useRef(false);
  const arrivalStartedRef = useRef(false);
  const currentPathnameRef = useRef(currentPathname);
  const timersRef = useRef<number[]>([]);

  currentPathnameRef.current = currentPathname;

  const clearAllTimers = useCallback(() => {
    if (typeof window !== 'undefined') {
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
    }
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((callback: () => void, delayMs: number) => {
    const id = window.setTimeout(callback, delayMs);
    timersRef.current.push(id);
    return id;
  }, []);

  const finishTransition = useCallback(
    (restoreHeadingFocus: boolean) => {
      clearAllTimers();
      isTransitioningRef.current = false;
      targetPathnameRef.current = null;
      gatePassedRef.current = false;
      arrivalStartedRef.current = false;
      unlockDocumentScroll();
      setIsTransitioning(false);
      setOverlayState(null);

      if (restoreHeadingFocus && typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          focusDestinationHeading();
        });
      }
    },
    [clearAllTimers],
  );

  const beginArrivalPhase = useCallback(() => {
    if (arrivalStartedRef.current || !isTransitioningRef.current) {
      return;
    }
    arrivalStartedRef.current = true;
    setOverlayState((prev) =>
      prev
        ? { ...prev, phase: 'arrival' }
        : { mode: 'cosmic', phase: 'arrival', fadingOutQuick: false },
    );
    scheduleTimer(() => {
      finishTransition(true);
    }, ARRIVAL_DURATION_MS);
  }, [finishTransition, scheduleTimer]);

  const evaluateArrivalReadiness = useCallback(() => {
    if (!isTransitioningRef.current || arrivalStartedRef.current || !gatePassedRef.current) {
      return;
    }
    const target = targetPathnameRef.current;
    if (!target) {
      return;
    }
    const pathReached = currentPathnameRef.current === target;
    const pageSignalled = readyPathnamesRef.current.has(target);
    if (pathReached && pageSignalled) {
      beginArrivalPhase();
    }
  }, [beginArrivalPhase]);

  useEffect(() => {
    evaluateArrivalReadiness();
  }, [currentPathname, evaluateArrivalReadiness]);

  const signalPageReady = useCallback(
    (pathname: string) => {
      const normalized = normalizePathname(pathname);
      readyPathnamesRef.current.add(normalized);
      evaluateArrivalReadiness();
    },
    [evaluateArrivalReadiness],
  );

  // Browser Back/Forward (`popstate`) uses a quick <= 300ms plain fade per §9.10 & ui_readme.md §12
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = () => {
      if (isTransitioningRef.current) {
        return;
      }
      clearAllTimers();
      setOverlayState({
        mode: 'quick-fade',
        phase: 'departure',
        fadingOutQuick: false,
      });
      scheduleTimer(() => {
        setOverlayState((prev) => (prev ? { ...prev, fadingOutQuick: true } : null));
      }, 60);
      scheduleTimer(() => {
        setOverlayState(null);
      }, 260);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [clearAllTimers, scheduleTimer]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      unlockDocumentScroll();
    };
  }, [clearAllTimers]);

  const performRouterNavigation = useCallback(
    (href: string, replace?: boolean) => {
      startTransition(() => {
        if (replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      });
    },
    [router],
  );

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      const parsed = parseInternalHref(href);

      // Ignore repeated clicks while Cosmic Launch is running (§9.10)
      if (isTransitioningRef.current) {
        return;
      }

      // Same-pathname (hash / query-only like /tasks/hub?task=...) or non-root href: navigate directly without Cosmic Launch
      if (
        !parsed ||
        !shouldTriggerCosmicLaunch({
          href,
          currentPathname: currentPathnameRef.current,
          isTransitioning: isTransitioningRef.current,
        })
      ) {
        performRouterNavigation(href, options?.replace);
        return;
      }

      // Reduced motion: plain <= 300ms opacity crossfade, no spacecraft, no streaks (§9.10)
      if (isReducedMotionPreferred()) {
        try {
          clearAllTimers();
          isTransitioningRef.current = true;
          setIsTransitioning(true);
          setOverlayState({
            mode: 'quick-fade',
            phase: 'departure',
            fadingOutQuick: false,
          });
          performRouterNavigation(href, options?.replace);

          scheduleTimer(() => {
            setOverlayState((prev) => (prev ? { ...prev, fadingOutQuick: true } : null));
          }, QUICK_FADE_HOLD_MS);

          scheduleTimer(() => {
            finishTransition(true);
          }, QUICK_FADE_TOTAL_MS);
        } catch {
          finishTransition(false);
          performRouterNavigation(href, options?.replace);
        }
        return;
      }

      // Full ~3s 4-phase Cosmic Launch sequence
      try {
        clearAllTimers();
        isTransitioningRef.current = true;
        targetPathnameRef.current = parsed.pathname;
        readyPathnamesRef.current.delete(parsed.pathname);
        gatePassedRef.current = false;
        arrivalStartedRef.current = false;

        lockDocumentScroll();
        setIsTransitioning(true);
        setOverlayState({
          mode: 'cosmic',
          phase: 'departure',
          fadingOutQuick: false,
        });

        performRouterNavigation(href, options?.replace);

        // Phase 2: Ignition (500–1300ms)
        scheduleTimer(() => {
          if (!isTransitioningRef.current || arrivalStartedRef.current) return;
          setOverlayState((prev) => (prev ? { ...prev, phase: 'ignition' } : prev));
        }, IGNITION_AT_MS);

        // Phase 3: Acceleration (1300–2300ms)
        scheduleTimer(() => {
          if (!isTransitioningRef.current || arrivalStartedRef.current) return;
          setOverlayState((prev) => (prev ? { ...prev, phase: 'acceleration' } : prev));
        }, ACCELERATION_AT_MS);

        // Phase 4 Gate (2300ms): enter Arrival if ready, else enter subtle idle Holding state
        scheduleTimer(() => {
          if (!isTransitioningRef.current || arrivalStartedRef.current) return;
          gatePassedRef.current = true;
          const target = targetPathnameRef.current;
          const isReady =
            target !== null &&
            currentPathnameRef.current === target &&
            readyPathnamesRef.current.has(target);

          if (isReady) {
            beginArrivalPhase();
          } else {
            setOverlayState((prev) => (prev ? { ...prev, phase: 'holding' } : prev));
          }
        }, ARRIVAL_GATE_MS);

        // 10-second safety failsafe (§9.10.4): reveal destination anyway and log warning
        scheduleTimer(() => {
          if (!isTransitioningRef.current || arrivalStartedRef.current) return;
          console.warn(
            `[CosmicLaunch] Destination "${parsed.pathname}" did not signal readiness within 10s; revealing page.`,
          );
          beginArrivalPhase();
        }, FAILSAFE_REVEAL_MS);
      } catch (error: unknown) {
        console.error('[CosmicLaunch] Navigation error:', error);
        finishTransition(false);
        pushToast('Navigation encountered an issue.', 'error');
        performRouterNavigation(href, options?.replace);
      }
    },
    [
      beginArrivalPhase,
      clearAllTimers,
      finishTransition,
      performRouterNavigation,
      pushToast,
      scheduleTimer,
    ],
  );

  const handleOverlayRuntimeError = useCallback(() => {
    finishTransition(false);
  }, [finishTransition]);

  const value = useMemo<TransitionContextValue>(
    () => ({
      isTransitioning,
      navigate,
      signalPageReady,
    }),
    [isTransitioning, navigate, signalPageReady],
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      {overlayState ? (
        <CosmicLaunchOverlay
          mode={overlayState.mode}
          phase={overlayState.phase}
          fadingOutQuick={overlayState.fadingOutQuick}
          onRuntimeError={handleOverlayRuntimeError}
        />
      ) : null}
    </TransitionContext.Provider>
  );
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
