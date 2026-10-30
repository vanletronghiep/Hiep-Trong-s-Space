'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '@/design/motion';
import { cn } from './cn';

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  'aria-label': string;
  id?: string;
  align?: 'right' | 'left';
  width?: number;
  mobileFullWidth?: boolean;
  autoFocusPanel?: boolean;
  children: ReactNode;
  className?: string;
}

export function Popover({
  open,
  onClose,
  anchorRef,
  'aria-label': ariaLabel,
  id,
  align = 'right',
  width = 240,
  mobileFullWidth = false,
  autoFocusPanel = false,
  children,
  className,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [positionStyle, setPositionStyle] = useState<CSSProperties>({});

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof window === 'undefined') {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const margin = 16;

    if (mobileFullWidth && viewportW < 640) {
      const top = Math.min(rect.bottom + 8, viewportH - 120);
      setPositionStyle({
        position: 'fixed',
        top: Math.max(margin, top),
        left: margin,
        right: margin,
      });
      return;
    }

    const effectiveWidth = Math.min(width, viewportW - margin * 2);
    let left = align === 'right' ? rect.right - effectiveWidth : rect.left;
    left = Math.max(margin, Math.min(left, viewportW - effectiveWidth - margin));

    const panelHeight = panelRef.current?.offsetHeight ?? 260;
    const spaceBelow = viewportH - rect.bottom - margin;
    const shouldFlipUp = spaceBelow < Math.min(panelHeight, 220) && rect.top > spaceBelow;
    const top = shouldFlipUp
      ? Math.max(margin, rect.top - panelHeight - 8)
      : Math.max(margin, rect.bottom + 8);

    setPositionStyle({
      position: 'fixed',
      top,
      left,
      width: effectiveWidth,
    });
  }, [align, anchorRef, mobileFullWidth, width]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const anchorEl = anchorRef.current;

    if (autoFocusPanel) {
      const timer = window.setTimeout(() => {
        panelRef.current?.focus();
      }, 15);
      return () => window.clearTimeout(timer);
    }

    void anchorEl;
    return undefined;
  }, [open, autoFocusPanel, anchorRef]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) {
        return;
      }
      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
    };

    const handleReposition = () => updatePosition();

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, onClose, anchorRef, updatePosition]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id={id}
          role="dialog"
          aria-label={ariaLabel}
          tabIndex={-1}
          style={{ ...positionStyle, zIndex: 'var(--z-popover)' }}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.99 }}
          transition={{
            duration: reducedMotion ? 0 : MOTION_DURATION.popoverOpen,
            ease: MOTION_EASE,
          }}
          className={cn(
            'origin-top-right rounded-card bg-ws-surface text-ws-text border border-ws-border shadow-popover',
            className,
          )}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
