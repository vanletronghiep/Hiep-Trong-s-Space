import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-item bg-[color-mix(in_srgb,var(--ws-accent-soft)_50%,transparent)] animate-pulse motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
