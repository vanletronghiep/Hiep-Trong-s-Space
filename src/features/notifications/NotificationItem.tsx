'use client';

import type { NotificationDto, NotificationKind } from '@/contracts';
import { formatRelativeAgeLabel } from '@/domain/notification-rules';
import { formatTimeLeftLabel } from '@/domain/task-status';
import { TransitionLink } from '@/features/transitions/TransitionLink';
import { Badge, type BadgeTone } from '@/ui/Badge';
import { Checkbox } from '@/ui/Checkbox';
import { cn } from '@/ui/cn';

const KIND_TO_BADGE_TONE: Record<NotificationKind, BadgeTone> = {
  due_soon: 'due-soon',
  overdue: 'overdue',
  completed: 'completed',
  general: 'general',
  system: 'system',
};

export interface NotificationItemProps {
  item: NotificationDto;
  now: Date;
  onToggleRead: (id: string, nextIsRead: boolean) => void;
  onNavigate: (item: NotificationDto) => void;
}

export function NotificationItem({ item, now, onToggleRead, onNavigate }: NotificationItemProps) {
  const ageLabel = formatRelativeAgeLabel(item.createdAt, now);
  const badgeTone = KIND_TO_BADGE_TONE[item.kind];
  const isOverdueTime = item.timeLeftMs !== null && item.timeLeftMs <= 0;
  const timeLeftText =
    item.timeLeftMs !== null ? formatTimeLeftLabel(item.timeLeftMs, isOverdueTime) : null;

  return (
    <div
      className={cn(
        'group relative rounded-item border border-ws-border px-3.5 py-3 transition-colors duration-[var(--dur-fast)] ease-[var(--ease)]',
        item.isRead
          ? 'bg-ws-surface'
          : 'bg-[color-mix(in_srgb,var(--ws-accent)_6%,var(--ws-surface))]',
        item.targetUrl && 'hover:border-[color-mix(in_srgb,var(--ws-accent)_55%,var(--ws-border))]',
      )}
    >
      {/* Row 1: Tag pill (left) + Read checkbox (right) */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <Badge tone={badgeTone} className="h-5">
          {item.tagLabel}
        </Badge>
        <div className="relative z-10">
          <Checkbox
            size="sm"
            checked={item.isRead}
            onCheckedChange={(checked) => onToggleRead(item.id, checked)}
            aria-label={
              item.isRead
                ? `Mark "${item.title}" notification as unread`
                : `Mark "${item.title}" notification as read`
            }
          />
        </div>
      </div>

      {/* Row 2: Unread dot + Title (stretched TransitionLink when task-linked) */}
      <div className="flex items-center gap-2">
        {!item.isRead ? (
          <span
            aria-hidden="true"
            data-testid="notification-unread-dot"
            className="h-2 w-2 rounded-pill bg-status-overdue shrink-0"
          />
        ) : null}
        {item.targetUrl ? (
          <TransitionLink
            href={item.targetUrl}
            onClick={() => onNavigate(item)}
            className="text-[length:var(--fs-ui)] font-semibold text-ws-text leading-snug after:absolute after:inset-0 after:rounded-item focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-ws-focus focus-visible:after:outline-offset-2"
          >
            {item.title}
          </TransitionLink>
        ) : (
          <span className="text-[length:var(--fs-ui)] font-semibold text-ws-text leading-snug">
            {item.title}
          </span>
        )}
      </div>

      {/* Row 3: Message */}
      {item.message ? (
        <p className="mt-1 text-[length:var(--fs-small)] text-ws-text-muted leading-relaxed line-clamp-2">
          {item.message}
        </p>
      ) : null}

      {/* Row 4: Time-left (left, when relevant) + N days ago (bottom-right corner) */}
      <div className="mt-2 flex items-center justify-between gap-3">
        {timeLeftText ? (
          <span
            className={cn(
              'text-[length:var(--fs-micro)] font-medium tabular-nums',
              isOverdueTime ? 'text-text-overdue' : 'text-text-due-soon',
            )}
          >
            {timeLeftText}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[length:var(--fs-micro)] text-ws-text-muted tabular-nums ml-auto">
          {ageLabel}
        </span>
      </div>
    </div>
  );
}
