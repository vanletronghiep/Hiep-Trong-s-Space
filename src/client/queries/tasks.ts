'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import type {
  CreateTaskInput,
  TaskDto,
  TaskQuery,
  TransferTaskInput,
  UpdateTaskInput,
} from '@/contracts';
import { sortTasks } from '@/domain/task-sort';
import { toTaskDto } from '@/domain/task-status';
import { apiRequest } from '../api-client';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (params?: TaskQuery) => ['tasks', 'list', params ?? {}] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
};

function buildTasksQueryString(params?: TaskQuery): string {
  if (!params) {
    return '';
  }
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.priority) sp.set('priority', params.priority);
  if (params.scheduledDate !== undefined) {
    sp.set('scheduledDate', params.scheduledDate === null ? 'null' : params.scheduledDate);
  }
  if (params.scheduledFrom) sp.set('scheduledFrom', params.scheduledFrom);
  if (params.scheduledTo) sp.set('scheduledTo', params.scheduledTo);
  if (params.deadlineFrom) sp.set('deadlineFrom', params.deadlineFrom);
  if (params.deadlineTo) sp.set('deadlineTo', params.deadlineTo);
  if (params.search) sp.set('search', params.search);
  const str = sp.toString();
  return str ? `?${str}` : '';
}

export function useTasks(params?: TaskQuery) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      const res = await apiRequest<{ items: TaskDto[] }>(
        `/api/tasks${buildTasksQueryString(params)}`,
      );
      return res.items;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

type TasksSnapshot = Array<[QueryKey, TaskDto[] | undefined]>;

function snapshotAndUpdateTaskLists(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (items: TaskDto[]) => TaskDto[],
): TasksSnapshot {
  const snapshots = queryClient.getQueriesData<TaskDto[]>({ queryKey: taskKeys.all });
  for (const [key, data] of snapshots) {
    if (Array.isArray(data)) {
      queryClient.setQueryData<TaskDto[]>(key, sortTasks(updater(data)));
    }
  }
  return snapshots;
}

function restoreTaskSnapshots(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshots: TasksSnapshot | undefined,
): void {
  if (!snapshots) {
    return;
  }
  for (const [key, data] of snapshots) {
    queryClient.setQueryData(key, data);
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await apiRequest<{ item: TaskDto }>('/api/tasks', {
        method: 'POST',
        body: input,
      });
      return res.item;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTaskInput }) => {
      const res = await apiRequest<{ item: TaskDto }>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: input,
      });
      return res.item;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const now = new Date();
      const snapshots = snapshotAndUpdateTaskLists(queryClient, (items) =>
        items.map((item) =>
          item.id === id
            ? toTaskDto(
                {
                  ...item,
                  ...input,
                  updatedAt: now.toISOString(),
                },
                now,
              )
            : item,
        ),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      restoreTaskSnapshots(queryClient, ctx?.snapshots);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ item: TaskDto }>(`/api/tasks/${id}/complete`, {
        method: 'POST',
      });
      return res.item;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const now = new Date();
      const nowIso = now.toISOString();
      const snapshots = snapshotAndUpdateTaskLists(queryClient, (items) =>
        items.map((item) =>
          item.id === id
            ? toTaskDto(
                {
                  ...item,
                  status: 'completed',
                  completedAt: nowIso,
                  reminderAt: null,
                  updatedAt: nowIso,
                },
                now,
              )
            : item,
        ),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      restoreTaskSnapshots(queryClient, ctx?.snapshots);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUncompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<{ item: TaskDto }>(`/api/tasks/${id}/uncomplete`, {
        method: 'POST',
      });
      return res.item;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const now = new Date();
      const nowIso = now.toISOString();
      const snapshots = snapshotAndUpdateTaskLists(queryClient, (items) =>
        items.map((item) =>
          item.id === id
            ? toTaskDto(
                {
                  ...item,
                  status: 'active',
                  completedAt: null,
                  updatedAt: nowIso,
                },
                now,
              )
            : item,
        ),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      restoreTaskSnapshots(queryClient, ctx?.snapshots);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useTransferTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TransferTaskInput }) => {
      const res = await apiRequest<{ item: TaskDto }>(`/api/tasks/${id}/transfer`, {
        method: 'POST',
        body: input,
      });
      return res.item;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const now = new Date();
      const nowIso = now.toISOString();
      const snapshots = snapshotAndUpdateTaskLists(queryClient, (items) =>
        items.map((item) =>
          item.id === id
            ? toTaskDto(
                {
                  ...item,
                  scheduledDate: input.scheduledDate,
                  deadlineAt: input.deadlineAt,
                  updatedAt: nowIso,
                },
                now,
              )
            : item,
        ),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      restoreTaskSnapshots(queryClient, ctx?.snapshots);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest<{ ok: true }>(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshots = snapshotAndUpdateTaskLists(queryClient, (items) =>
        items.filter((item) => item.id !== id),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      restoreTaskSnapshots(queryClient, ctx?.snapshots);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
