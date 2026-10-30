import type { ReactNode } from 'react';
import { StarIcon } from './StarIcon';
import { cn } from './cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  const orbitSize = compact ? 56 : 72;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-6 px-4 gap-2.5' : 'py-10 px-6 gap-3',
        className,
      )}
    >
      <div
        aria-hidden="true"
        style={{ width: orbitSize, height: orbitSize }}
        className="relative flex items-center justify-center"
      >
        <span className="absolute inset-0 rounded-pill border border-ws-accent-soft" />
        <span className="absolute inset-[10px] rounded-pill border border-ws-accent-soft" />
        <span className="absolute -top-1 right-2 text-ws-accent">
          <StarIcon size={10} />
        </span>
      </div>
      <div className="space-y-1 max-w-[var(--max-narrow)]">
        <p
          className={cn(
            description
              ? 'text-[0.9375rem] font-semibold text-ws-text'
              : 'text-[length:var(--fs-ui)] font-medium text-ws-text-muted',
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="text-[length:var(--fs-small)] text-ws-text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
