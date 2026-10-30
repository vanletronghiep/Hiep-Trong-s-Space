'use client';

import { cn } from '@/ui/cn';

export interface WordmarkProps {
  className?: string;
}

/**
 * Custom typographic lock-up ("Hiep Trong" signature + dominant uppercase "SPACE")
 * per agent_readme.md §9.6 and ui_readme.md §10.2.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <h1
      aria-label="Hiep Trong Space"
      className={cn('relative inline-flex flex-col items-center select-text max-w-full', className)}
    >
      <span className="sr-only">Hiep Trong Space</span>
      <span
        aria-hidden="true"
        className="relative z-10 self-start pl-[0.08em] sm:pl-[0.14em] -mb-[0.34em] font-display italic font-normal text-[length:var(--fs-wordmark-signature)] leading-none text-[color-mix(in_srgb,var(--cosmos-text)_90%,transparent)]"
      >
        Hiep Trong
      </span>
      <span
        aria-hidden="true"
        className="font-display font-light uppercase text-[length:var(--fs-wordmark-space)] leading-[0.9] text-cosmos-text tracking-[var(--ls-wordmark-mobile)] sm:tracking-[var(--ls-wordmark)] pl-[var(--ls-wordmark-mobile)] sm:pl-[var(--ls-wordmark)]"
      >
        SPACE
      </span>
    </h1>
  );
}
