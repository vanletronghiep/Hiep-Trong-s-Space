'use client';

import { useId, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/client/queries/notifications';
import { IconButton } from '@/ui/IconButton';
import { cn } from '@/ui/cn';
import { NotificationPopover } from './NotificationPopover';

export interface BellButtonProps {
  tone?: 'workspace' | 'cosmos';
  className?: string;
}

export function BellButton({ tone = 'workspace', className }: BellButtonProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();
  const { data } = useNotifications();

  const unreadCount = data?.unreadCount ?? 0;
  const countLabel = unreadCount > 9 ? '9+' : String(unreadCount);
  const ariaLabel = unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications';

  return (
    <>
      <IconButton
        ref={buttonRef}
        tone={tone}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={className}
      >
        <Bell size={20} strokeWidth={1.5} />
        {unreadCount > 0 ? (
          <span
            data-testid="bell-unread-indicator"
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1.5 right-1.5 inline-flex items-center justify-center rounded-pill bg-status-overdue font-semibold leading-none tabular-nums ring-2',
              tone === 'cosmos'
                ? 'ring-cosmos-bg-0 text-cosmos-bg-0'
                : 'ring-ws-bg text-ws-surface',
              unreadCount === 1
                ? 'h-2 w-2'
                : 'min-w-[16px] h-[16px] px-1 text-[10px] -top-0.5 -right-0.5',
            )}
          >
            {unreadCount > 1 ? countLabel : null}
          </span>
        ) : null}
      </IconButton>

      <NotificationPopover
        id={popoverId}
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
      />
    </>
  );
}
