import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export type BadgeTone =
  | 'urgent'
  | 'normal'
  | 'optional'
  | 'overdue'
  | 'due-soon'
  | 'completed'
  | 'general'
  | 'system'
  | 'count';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  withDot?: boolean;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  urgent:
    'bg-[color-mix(in_srgb,var(--status-overdue)_16%,var(--ws-surface))] text-text-overdue border border-transparent',
  normal: 'bg-ws-accent-soft text-ws-text border border-transparent',
  optional: 'bg-transparent text-ws-text-muted border border-ws-border',
  overdue:
    'bg-[color-mix(in_srgb,var(--status-overdue)_16%,var(--ws-surface))] text-text-overdue border border-transparent',
  'due-soon':
    'bg-[color-mix(in_srgb,var(--status-due-soon)_16%,var(--ws-surface))] text-text-due-soon border border-transparent',
  completed:
    'bg-[color-mix(in_srgb,var(--status-notif-completed)_18%,var(--ws-surface))] text-text-notif-completed border border-transparent',
  general:
    'bg-[color-mix(in_srgb,var(--ws-accent)_18%,var(--ws-surface))] text-text-accent border border-transparent',
  system:
    'bg-[color-mix(in_srgb,var(--status-system)_16%,var(--ws-surface))] text-text-system border border-transparent',
  count: 'bg-ws-accent-soft text-ws-text border border-transparent tabular-nums',
};

const dotClasses: Partial<Record<BadgeTone, string>> = {
  urgent: 'bg-status-overdue',
  overdue: 'bg-status-overdue',
  'due-soon': 'bg-status-due-soon',
  completed: 'bg-status-notif-completed',
  general: 'bg-ws-accent',
  system: 'bg-status-system',
};

export function Badge({
  tone = 'normal',
  withDot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const dotClass = dotClasses[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-[22px] px-2.5 rounded-pill font-medium whitespace-nowrap text-[length:var(--fs-micro)] leading-none',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {withDot && dotClass ? (
        <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-pill shrink-0', dotClass)} />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
