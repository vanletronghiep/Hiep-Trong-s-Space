'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '@/design/motion';
import { cn } from './cn';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface ToastContextValue {
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const reducedMotion = useReducedMotion();

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);

      // Errors persist until dismissed per ui_readme.md §9.9; others dismiss after 4s.
      if (tone !== 'error') {
        const timer = window.setTimeout(() => {
          dismissToast(id);
        }, 4000);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      for (const timer of activeTimers.values()) {
        window.clearTimeout(timer);
      }
      activeTimers.clear();
    };
  }, []);

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{ zIndex: 'var(--z-toast)' }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 px-4 w-full max-w-[420px] pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
              transition={{
                duration: reducedMotion ? 0 : MOTION_DURATION.fast,
                ease: MOTION_EASE,
              }}
              className={cn(
                'pointer-events-auto flex items-center gap-2.5 w-full rounded-item bg-ws-surface text-ws-text border px-3.5 py-2.5 shadow-popover text-[length:var(--fs-ui)]',
                toast.tone === 'error' ? 'border-tint-overdue-border' : 'border-ws-border',
              )}
            >
              {toast.tone === 'error' ? (
                <AlertCircle size={16} strokeWidth={1.5} className="text-text-overdue shrink-0" />
              ) : toast.tone === 'success' ? (
                <CheckCircle2
                  size={16}
                  strokeWidth={1.5}
                  className="text-text-notif-completed shrink-0"
                />
              ) : null}
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="inline-flex items-center justify-center h-7 w-7 rounded-pill text-ws-text-muted hover:text-ws-text hover:bg-ws-accent-soft cursor-pointer shrink-0"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
