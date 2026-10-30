'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MOTION_DURATION } from '@/design/motion';

export function FinishedCounter({ count }: { count: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      aria-label={`${count} finished tasks`}
      className="inline-flex items-center justify-center h-6 px-2.5 rounded-pill bg-ws-accent-soft text-ws-text text-[length:var(--fs-micro)] font-medium tabular-nums whitespace-nowrap"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={count}
          initial={reducedMotion ? false : { opacity: 0.4 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? { opacity: 1 } : { opacity: 0.4 }}
          transition={{ duration: reducedMotion ? 0 : MOTION_DURATION.fast }}
        >
          {count} done
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
