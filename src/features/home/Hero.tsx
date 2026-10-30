'use client';

import { motion, useReducedMotion } from 'motion/react';
import { MOTION_EASE } from '@/design/motion';
import { BellButton } from '@/features/notifications/BellButton';
import { StarIcon } from '@/ui/StarIcon';
import { LetsGoButton } from './LetsGoButton';
import { Wordmark } from './Wordmark';

const HERO_DURATION = 0.9;

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      {/* Fixed top-right controls: Bell then "Let's go" — no other nav on homepage (§9.5 & ui_readme.md §10.6) */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: reducedMotion ? 0 : 0.7,
          delay: reducedMotion ? 0 : 0.9,
          ease: MOTION_EASE,
        }}
        style={{
          zIndex: 'var(--z-nav)',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 'max(16px, env(safe-area-inset-right))',
        }}
        className="fixed sm:!top-[max(20px,env(safe-area-inset-top))] sm:!right-[max(20px,env(safe-area-inset-right))] flex items-center gap-2 sm:gap-2.5"
      >
        <BellButton tone="cosmos" />
        <LetsGoButton />
      </motion.div>

      {/* Full-viewport hero composition optically centred (~ -3svh) per ui_readme.md §10.1 */}
      <section
        aria-label="Introduction"
        className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-[var(--gutter)] lg:px-[var(--gutter-lg)] pt-20 pb-[calc(5rem+3svh)] text-center"
      >
        <div className="mx-auto flex w-full max-w-[var(--max-content)] flex-col items-center">
          {/* Single subtle four-point star above the wordmark (+600ms entrance) */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0 : HERO_DURATION,
              delay: reducedMotion ? 0 : 0.6,
              ease: MOTION_EASE,
            }}
            className="mb-5 text-cosmos-lavender"
          >
            <StarIcon size={16} />
          </motion.div>

          {/* Wordmark lock-up (0ms entrance, 900ms fade + 8px gentle rise) */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : HERO_DURATION,
              delay: 0,
              ease: MOTION_EASE,
            }}
            className="max-w-full"
          >
            <Wordmark />
          </motion.div>

          {/* Supporting statement (+300ms entrance, 2.5rem below wordmark) */}
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : HERO_DURATION,
              delay: reducedMotion ? 0 : 0.3,
              ease: MOTION_EASE,
            }}
            className="mt-10 max-w-[var(--max-narrow)] text-[clamp(0.9375rem,1.3vw,1.0625rem)] leading-[var(--lh-relaxed)] tracking-[var(--ls-support)] text-cosmos-text-muted"
          >
            A space for everything I aspire to become.
          </motion.p>

          {/* Tagline (+450ms entrance, 0.75rem below statement) */}
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : HERO_DURATION,
              delay: reducedMotion ? 0 : 0.45,
              ease: MOTION_EASE,
            }}
            className="mt-3 max-w-[var(--max-narrow)] text-[length:var(--fs-ui)] leading-[var(--lh-relaxed)] text-[color-mix(in_srgb,var(--cosmos-text-muted)_80%,transparent)]"
          >
            Ideas, projects, and ambitions — in one quiet place.
          </motion.p>
        </div>
      </section>
    </>
  );
}
