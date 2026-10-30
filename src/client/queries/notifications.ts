'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationDto, NotificationListResponse } from '@/contracts';
import { apiRequest } from '../api-client';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => ['notifications', 'list'] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      return apiRequest<NotificationListResponse>('/api/notifications');
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

function updateCachedList(
  prev: NotificationListResponse | undefined,
  updater: (items: NotificationDto[]) => NotificationDto[],
): NotificationListResponse | undefined {
  if (!prev) {
    return prev;
  }
  const items = updater(prev.items);
  const unreadCount = items.filter((item) => !item.isRead).length;
  return { items, unreadCount };
}

export function useSetNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const action = isRead ? 'read' : 'unread';
      const res = await apiRequest<{ item: NotificationDto }>(
        `/api/notifications/${id}/${action}`,
        { method: 'POST' },
      );
      return res.item;
    },
    onMutate: async ({ id, isRead }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueryData<NotificationListResponse>(notificationKeys.list());
      queryClient.setQueryData<NotificationListResponse>(notificationKeys.list(), (prev) =>
        updateCachedList(prev, (items) =>
          items.map((item) => (item.id === id ? { ...item, isRead } : item)),
        ),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(notificationKeys.list(), ctx.snapshot);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiRequest<{ ok: true; updatedCount: number }>('/api/notifications/read-all', {
        method: 'POST',
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueryData<NotificationListResponse>(notificationKeys.list());
      queryClient.setQueryData<NotificationListResponse>(notificationKeys.list(), (prev) =>
        updateCachedList(prev, (items) => items.map((item) => ({ ...item, isRead: true }))),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(notificationKeys.list(), ctx.snapshot);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
