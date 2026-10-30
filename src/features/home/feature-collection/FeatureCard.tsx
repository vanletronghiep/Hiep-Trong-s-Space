'use client';

import { ArrowUpRight } from 'lucide-react';
import type { FeatureEntry } from '@/features/registry';
import { TransitionLink } from '@/features/transitions/TransitionLink';
import { cn } from '@/ui/cn';
import { FeatureThumbnail } from './FeatureThumbnail';

export interface FeatureCardProps {
  feature: FeatureEntry;
  className?: string;
}

/**
 * Shared Feature Collection card (identical across Horizontal and Vertical layouts)
 * per agent_readme.md §9.9 and ui_readme.md §11.3.
 */
export function FeatureCard({ feature, className }: FeatureCardProps) {
  return (
    <TransitionLink
      href={feature.href}
      data-feature-id={feature.id}
      className={cn(
        'group block rounded-card text-left cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-[var(--cosmos-focus)] focus-visible:outline-offset-4',
        className,
      )}
    >
      <FeatureThumbnail thumbnail={feature.thumbnail} />

      <p className="mt-4 text-[length:var(--fs-small)] leading-none text-cosmos-text-muted">
        {feature.label}
      </p>

      <div className="mt-1 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-[length:var(--fs-card-title)] font-light leading-[1.1] text-cosmos-text transition-colors duration-[240ms] ease-[var(--ease)] [@media(hover:hover)]:group-hover:text-[color-mix(in_srgb,var(--cosmos-text)_88%,var(--cosmos-lavender))] group-focus-visible:text-[color-mix(in_srgb,var(--cosmos-text)_88%,var(--cosmos-lavender))]">
          {feature.title}
        </h3>
        <ArrowUpRight
          size={18}
          strokeWidth={1.5}
          aria-hidden="true"
          className="shrink-0 translate-y-[1px] text-cosmos-text opacity-60 transition-[opacity,transform] duration-[240ms] ease-[var(--ease)] [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-[2px] [@media(hover:hover)]:group-hover:-translate-y-[1px] group-focus-visible:opacity-100 group-focus-visible:translate-x-[2px] group-focus-visible:-translate-y-[1px]"
        />
      </div>
    </TransitionLink>
  );
}
