'use client';

import type { RefObject } from 'react';
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useSetNotificationRead,
} from '@/client/queries/notifications';
import { useMinuteTicker } from '@/client/use-minute-ticker';
import type { NotificationDto } from '@/contracts';
import { EmptyState } from '@/ui/EmptyState';
import { Popover } from '@/ui/Popover';
import { Skeleton } from '@/ui/Skeleton';
import { useToast } from '@/ui/Toast';
import { NotificationItem } from './NotificationItem';

export interface NotificationPopoverProps {
  id: string;
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}

export function NotificationPopover({ id, open, onClose, anchorRef }: NotificationPopoverProps) {
  const { data, isLoading, isError, refetch } = useNotifications();
  const setReadMutation = useSetNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const now = useMinuteTicker();
  const { pushToast } = useToast();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleToggleRead = (notificationId: string, nextIsRead: boolean) => {
    setReadMutation.mutate(
      { id: notificationId, isRead: nextIsRead },
      {
        onError: () => {
          pushToast('Could not update notification status.', 'error');
        },
      },
    );
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0 || markAllReadMutation.isPending) {
      return;
    }
    markAllReadMutation.mutate(undefined, {
      onError: () => {
        pushToast('Could not mark notifications as read.', 'error');
      },
    });
  };

  const handleNavigate = (item: NotificationDto) => {
    if (!item.isRead) {
      setReadMutation.mutate({ id: item.id, isRead: true });
    }
    onClose();
  };

  return (
    <Popover
      id={id}
      open={open}
      onClose={onClose}
      anchorRef={anchorRef}
      aria-label="Notifications"
      align="right"
      width={380}
      mobileFullWidth
      autoFocusPanel
      className="p-0 overflow-hidden"
    >
      <div
        data-theme="workspace"
        className="flex flex-col max-h-[70dvh] bg-ws-surface text-ws-text"
      >
        {/* Header (padding 16px 16px 12px, bottom hairline) */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-ws-border shrink-0">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[1rem] font-semibold text-ws-text leading-none">Notifications</h2>
            <span className="text-[length:var(--fs-small)] text-ws-text-muted tabular-nums">
              {unreadCount} unread
            </span>
          </div>

          <button
            type="button"
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            aria-disabled={unreadCount === 0 || markAllReadMutation.isPending || undefined}
            onClick={handleMarkAllRead}
            className="rounded-pill px-2.5 py-1 text-[length:var(--fs-small)] font-medium text-ws-text transition-colors duration-[var(--dur-fast)] hover:bg-ws-accent-soft disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
          >
            Mark all as read
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-3 flex-1">
          {isLoading ? (
            <div className="space-y-2" aria-label="Loading notifications">
              <Skeleton className="h-[88px] w-full rounded-item" />
              <Skeleton className="h-[88px] w-full rounded-item" />
            </div>
          ) : isError ? (
            <div className="py-6 px-4 text-center space-y-2">
              <p className="text-[length:var(--fs-ui)] text-text-overdue font-medium">
                Could not load notifications.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-pill px-3 py-1.5 text-[length:var(--fs-small)] font-medium bg-ws-accent-soft text-ws-text hover:bg-[color-mix(in_srgb,var(--ws-accent)_35%,var(--ws-surface))] transition-colors duration-[var(--dur-fast)] cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              compact
              title="All caught up."
              description="Your universe is running smoothly."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  now={now}
                  onToggleRead={handleToggleRead}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Popover>
  );
}
