import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { NotificationRecord, TaskRecord } from '@/contracts';
import { ConflictError } from '@/services/errors';
import type { StorageAdapter } from '@/services/storage/storage-adapter';

export interface StorageTestHarness {
  adapter: StorageAdapter;
  cleanup: () => Promise<void>;
}

function makeTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Write architecture tests',
    description: overrides.description ?? 'Cover SQLite repositories and cascades',
    priority: overrides.priority ?? 'normal',
    pinned: overrides.pinned ?? false,
    deadlineAt: overrides.deadlineAt ?? '2026-10-30T16:59:00.000Z',
    scheduledDate: overrides.scheduledDate === undefined ? '2026-10-30' : overrides.scheduledDate,
    status: overrides.status ?? 'active',
    completedAt: overrides.completedAt ?? null,
    reminderAt:
      overrides.reminderAt === undefined ? '2026-10-29T16:59:00.000Z' : overrides.reminderAt,
    createdAt: overrides.createdAt ?? '2026-10-28T03:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-10-28T03:00:00.000Z',
  };
}

function makeNotification(overrides: Partial<NotificationRecord> = {}): NotificationRecord {
  const id = overrides.id ?? crypto.randomUUID();
  return {
    id,
    kind: overrides.kind ?? 'due_soon',
    taskId: overrides.taskId === undefined ? null : overrides.taskId,
    dedupeKey: overrides.dedupeKey ?? `notif:${id}`,
    payload: overrides.payload === undefined ? null : overrides.payload,
    createdAt: overrides.createdAt ?? '2026-10-30T03:00:00.000Z',
    readAt: overrides.readAt ?? null,
  };
}

export function runStorageAdapterContractTests(
  adapterName: string,
  createHarness: () => Promise<StorageTestHarness>,
): void {
  describe(`${adapterName} contract`, () => {
    let harness: StorageTestHarness;

    beforeEach(async () => {
      harness = await createHarness();
      await harness.adapter.init();
    });

    afterEach(async () => {
      await harness.adapter.close();
      await harness.cleanup();
    });

    it('creates, reads, updates (upserts), and deletes tasks', async () => {
      const task = makeTask({ title: 'Initial title', pinned: false });
      await harness.adapter.tasks.saveItem(task);

      const loaded = await harness.adapter.tasks.getItem(task.id);
      expect(loaded).toEqual(task);

      const updated: TaskRecord = {
        ...task,
        title: 'Updated title',
        pinned: true,
        status: 'completed',
        completedAt: '2026-10-30T10:00:00.000Z',
        reminderAt: null,
        updatedAt: '2026-10-30T10:00:00.000Z',
      };
      await harness.adapter.tasks.saveItem(updated);

      const reloaded = await harness.adapter.tasks.getItem(task.id);
      expect(reloaded).toEqual(updated);

      await harness.adapter.tasks.deleteItem(task.id);
      expect(await harness.adapter.tasks.getItem(task.id)).toBeNull();
    });

    it('filters tasks by status, priority, scheduledDate (including null), ranges, and search', async () => {
      const t1 = makeTask({
        title: 'Prepare APCS lecture notes',
        description: 'Distributed systems week 4',
        priority: 'urgent',
        scheduledDate: '2026-10-29',
        deadlineAt: '2026-10-29T16:59:00.000Z',
        status: 'active',
        createdAt: '2026-10-28T01:00:00.000Z',
      });
      const t2 = makeTask({
        title: 'Review Hiệp Trọng Space tokens',
        description: 'Check 100% contrast ratios',
        priority: 'normal',
        scheduledDate: '2026-10-30',
        deadlineAt: '2026-10-30T16:59:00.000Z',
        status: 'active',
        createdAt: '2026-10-28T02:00:00.000Z',
      });
      const t3 = makeTask({
        title: 'Unscheduled backlog item',
        description: 'Hub-only task',
        priority: 'optional',
        scheduledDate: null,
        deadlineAt: '2026-11-05T16:59:00.000Z',
        status: 'completed',
        completedAt: '2026-10-30T05:00:00.000Z',
        reminderAt: null,
        createdAt: '2026-10-28T03:00:00.000Z',
      });

      await harness.adapter.tasks.saveItem(t1);
      await harness.adapter.tasks.saveItem(t2);
      await harness.adapter.tasks.saveItem(t3);

      expect(
        (await harness.adapter.tasks.listItems({ status: 'active' })).map((t) => t.id),
      ).toEqual([t1.id, t2.id]);
      expect(
        (await harness.adapter.tasks.listItems({ priority: 'urgent' })).map((t) => t.id),
      ).toEqual([t1.id]);
      expect(
        (await harness.adapter.tasks.listItems({ scheduledDate: '2026-10-30' })).map((t) => t.id),
      ).toEqual([t2.id]);
      expect(
        (await harness.adapter.tasks.listItems({ scheduledDate: null })).map((t) => t.id),
      ).toEqual([t3.id]);
      expect(
        (
          await harness.adapter.tasks.listItems({
            scheduledFrom: '2026-10-29',
            scheduledTo: '2026-10-30',
          })
        ).map((t) => t.id),
      ).toEqual([t1.id, t2.id]);
      expect(
        (await harness.adapter.tasks.listItems({ search: 'hiệp trọng' })).map((t) => t.id),
      ).toEqual([t2.id]);
      expect((await harness.adapter.tasks.listItems({ search: '100%' })).map((t) => t.id)).toEqual([
        t2.id,
      ]);
    });

    it('stores notifications ordered newest-first, enforces unique dedupeKey, and cascades on task delete', async () => {
      const task = makeTask();
      await harness.adapter.tasks.saveItem(task);

      const older = makeNotification({
        kind: 'due_soon',
        taskId: task.id,
        dedupeKey: `task:${task.id}:due_soon:${task.deadlineAt}`,
        createdAt: '2026-10-29T17:00:00.000Z',
      });
      const newer = makeNotification({
        kind: 'system',
        taskId: null,
        dedupeKey: 'system:welcome',
        payload: { title: 'Welcome', message: 'Workspace initialized.' },
        createdAt: '2026-10-30T08:00:00.000Z',
      });

      await harness.adapter.notifications.saveItem(older);
      await harness.adapter.notifications.saveItem(newer);

      const all = await harness.adapter.notifications.listItems();
      expect(all.map((n) => n.id)).toEqual([newer.id, older.id]);
      expect(all[0]?.payload).toEqual({ title: 'Welcome', message: 'Workspace initialized.' });

      // Duplicate dedupeKey with a different id must fail with ConflictError
      const duplicate = makeNotification({
        kind: 'due_soon',
        taskId: task.id,
        dedupeKey: older.dedupeKey,
      });
      await expect(harness.adapter.notifications.saveItem(duplicate)).rejects.toBeInstanceOf(
        ConflictError,
      );

      // Deleting the parent task cascades to its linked notifications while preserving system notifications
      await harness.adapter.tasks.deleteItem(task.id);
      const remaining = await harness.adapter.notifications.listItems();
      expect(remaining.map((n) => n.id)).toEqual([newer.id]);
    });

    it('supports notification filtering and deleteWhere for stale removal and 7-day retention purge', async () => {
      const task = makeTask();
      await harness.adapter.tasks.saveItem(task);

      const staleDueSoon = makeNotification({
        kind: 'due_soon',
        taskId: task.id,
        dedupeKey: `task:${task.id}:due_soon:old`,
        createdAt: '2026-10-20T00:00:00.000Z',
      });
      const staleOverdue = makeNotification({
        kind: 'overdue',
        taskId: task.id,
        dedupeKey: `task:${task.id}:overdue:old`,
        createdAt: '2026-10-21T00:00:00.000Z',
        readAt: '2026-10-21T01:00:00.000Z',
      });
      const recentSystem = makeNotification({
        kind: 'system',
        taskId: null,
        dedupeKey: 'system:recent',
        payload: { title: 'System', message: 'Healthy' },
        createdAt: '2026-10-30T02:00:00.000Z',
      });

      await harness.adapter.notifications.saveItem(staleDueSoon);
      await harness.adapter.notifications.saveItem(staleOverdue);
      await harness.adapter.notifications.saveItem(recentSystem);

      const unread = await harness.adapter.notifications.listItems({ unreadOnly: true });
      expect(unread.map((n) => n.id)).toEqual([recentSystem.id, staleDueSoon.id]);

      // Remove stale due_soon for task
      const removedStale = await harness.adapter.notifications.deleteWhere({
        taskId: task.id,
        kinds: ['due_soon'],
      });
      expect(removedStale).toBe(1);

      // Purge notifications created on or before 7 days ago
      const purgedCount = await harness.adapter.notifications.deleteWhere({
        createdAtOnOrBefore: '2026-10-23T00:00:00.000Z',
      });
      expect(purgedCount).toBe(1);

      const survivors = await harness.adapter.notifications.listItems();
      expect(survivors.map((n) => n.id)).toEqual([recentSystem.id]);
    });

    it('uploads, retrieves, and deletes binary media items', async () => {
      const sampleBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
      const uploaded = await harness.adapter.media.uploadMedia({
        name: 'star.png',
        mimeType: 'image/png',
        data: sampleBytes,
      });

      expect(uploaded.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(uploaded.url).toBe(`/api/media/${uploaded.id}`);

      const fetched = await harness.adapter.media.getMedia(uploaded.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.mimeType).toBe('image/png');
      expect(Array.from(fetched?.data ?? [])).toEqual(Array.from(sampleBytes));

      await harness.adapter.media.deleteMedia(uploaded.id);
      expect(await harness.adapter.media.getMedia(uploaded.id)).toBeNull();
    });
  });
}
