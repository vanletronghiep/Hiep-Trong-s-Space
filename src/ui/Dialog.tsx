'use client';

import { useId, useRef, type ReactNode, type RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATION, MOTION_EASE } from '@/design/motion';
import { Button } from './Button';
import { cn } from './cn';
import { useFocusTrap } from './use-focus-trap';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  initialFocusRef,
  children,
  footer,
  className,
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useFocusTrap({
    open,
    containerRef: panelRef,
    initialFocusRef,
    onClose,
  });

  return (
    <AnimatePresence>
      {open ? (
        <div
          style={{ zIndex: 'var(--z-drawer)' }}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0 : MOTION_DURATION.drawerClose,
              ease: MOTION_EASE,
            }}
            onClick={onClose}
            className="fixed inset-0 bg-ws-scrim"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }}
            transition={{
              duration: reducedMotion ? 0 : MOTION_DURATION.base,
              ease: MOTION_EASE,
            }}
            className={cn(
              'relative w-full max-w-[400px] rounded-card bg-ws-surface border border-ws-border shadow-popover p-6 text-ws-text',
              className,
            )}
          >
            <h2
              id={titleId}
              className="font-display text-[1.375rem] leading-[var(--lh-heading)] font-medium text-ws-text"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descId}
                className="mt-2 text-[length:var(--fs-ui)] leading-[var(--lh-body)] text-ws-text-muted"
              >
                {description}
              </p>
            ) : null}
            {children ? <div className="mt-4">{children}</div> : null}
            {footer ? (
              <div className="mt-6 flex items-center justify-end gap-2.5">{footer}</div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isSubmitting = false,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      initialFocusRef={cancelButtonRef}
      footer={
        <>
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button variant="destructive-solid" onClick={onConfirm} disabled={isSubmitting}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
