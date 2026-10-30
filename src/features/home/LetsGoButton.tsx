'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/ui/cn';

export interface LetsGoButtonProps {
  targetId?: string;
  className?: string;
}

export function LetsGoButton({ targetId = 'features', className }: LetsGoButtonProps) {
  const handleClick = () => {
    if (typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    const reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollIntoView?.({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <button
      type="button"
      aria-label="Let's go"
      onClick={handleClick}
      className={cn(
        'group relative inline-grid place-items-center h-10 px-[22px] rounded-pill whitespace-nowrap cursor-pointer select-none',
        // Invisible vertical hit-area expansion to guarantee >= 44x44px touch target (§9.8 & ui_readme.md §7)
        'after:content-[""] after:absolute after:-inset-y-1 after:inset-x-0',
        'border border-[color-mix(in_srgb,var(--cosmos-text)_22%,transparent)]',
        'bg-[color-mix(in_srgb,var(--cosmos-bg-0)_40%,transparent)] text-cosmos-text',
        'text-[length:var(--fs-ui)] font-medium',
        'transition-[background-color,border-color] duration-[280ms] ease-[var(--ease)]',
        '[@media(hover:hover)]:hover:border-[color-mix(in_srgb,var(--cosmos-text)_45%,transparent)]',
        '[@media(hover:hover)]:hover:bg-[color-mix(in_srgb,var(--cosmos-text)_8%,transparent)]',
        'focus-visible:border-[color-mix(in_srgb,var(--cosmos-text)_45%,transparent)]',
        'focus-visible:bg-[color-mix(in_srgb,var(--cosmos-text)_8%,transparent)]',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          '[grid-area:1/1] inline-block transition-[opacity,transform] duration-[280ms] ease-[var(--ease)]',
          'opacity-100 translate-x-0',
          '[@media(hover:hover)]:group-hover:opacity-0 [@media(hover:hover)]:group-hover:translate-x-2',
          'group-focus-visible:opacity-0 group-focus-visible:translate-x-2',
          'group-active:opacity-0 group-active:translate-x-2',
        )}
      >
        Let&apos;s go
      </span>

      <span
        aria-hidden="true"
        className={cn(
          '[grid-area:1/1] inline-flex items-center justify-center transition-[opacity,transform] duration-[280ms] ease-[var(--ease)]',
          'opacity-0 -translate-x-2.5',
          '[@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-0',
          'group-focus-visible:opacity-100 group-focus-visible:translate-x-0',
          'group-active:opacity-100 group-active:translate-x-0',
        )}
      >
        <ArrowRight size={18} strokeWidth={1.5} />
      </span>
    </button>
  );
}
