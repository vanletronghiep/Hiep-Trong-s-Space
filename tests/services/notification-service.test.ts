import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Clock } from '@/domain/clock';
import { formatRelativeAgeLabel } from '@/domain/notification-rules';
import { NotificationService } from '@/services/notification-service';
import { createStorageAdapter } from '@/services/storage/factory';
import type { StorageAdapter } from '@/services/storage/storage-adapter';
import { TaskService } from '@/services/task-service';

class MutableClock implements Clock {
  private current: Date;

  constructor(isoInstant: string) {
    this.current = new Date(isoInstant);
  }

  now(): Date {
    return new Date(this.current.getTime());
  }

  set(isoInstant: string): void {
    this.current = new Date(isoInstant);
  }
}

describe('NotificationService (§6.9, §6.10, Epic 4)', () => {
  let tempDir: string;
  let storage: StorageAdapter;
  let clock: MutableClock;
  let taskService: TaskService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hts-notif-service-'));
    storage = createStorageAdapter({
      storageDriver: 'local',
      databasePath: path.join(tempDir, 'notifications.db'),
      mediaDir: path.join(tempDir, 'media'),
      googleDriveFolderId: '',
    });
    await storage.init();
    clock = new MutableClock('2026-10-30T10:00:00.000Z');
    taskService = new TaskService({ storage, clock });
    notificationService = new NotificationService({
      storage,
      clock,
      timeZone: 'Asia/Saigon',
    });
  });

  afterEach(async () => {
    await storage.close();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('yields exactly one due_soon at 1m30s and one overdue at 2m00s for a task due in 2 minutes, with zero duplicates', async () => {
    // T0 = 10:00:00Z, deadline = 10:02:00Z (remaining = 120s -> quarter rule = notify 30s before -> 10:01:30Z)
    const task = await taskService.createTask({
      title: 'Submit assignment',
      deadlineAt: '2026-10-30T10:02:00.000Z',
    });
    expect(task.reminderAt).toBe('2026-10-30T10:01:30.000Z');

    // Before reminderAt -> nothing emitted
    clock.set('2026-10-30T10:01:29.000Z');
    expect((await notificationService.runReminderTick()).createdCount).toBe(0);
    expect((await notificationService.listNotifications()).items).toHaveLength(0);

    // At reminderAt -> exactly 1 due_soon notification
    clock.set('2026-10-30T10:01:30.000Z');
    expect((await notificationService.runReminderTick()).createdCount).toBe(1);
    // Repeated tick -> 0 duplicates
    expect((await notificationService.runReminderTick()).createdCount).toBe(0);

    const afterDueSoon = await notificationService.listNotifications();
    expect(afterDueSoon.items).toHaveLength(1);
    expect(afterDueSoon.unreadCount).toBe(1);
    expect(afterDueSoon.items[0]?.kind).toBe('due_soon');
    expect(afterDueSoon.items[0]?.title).toBe('Due soon');
    expect(afterDueSoon.items[0]?.tagLabel).toBe('Due soon');
    expect(afterDueSoon.items[0]?.message).toContain('"Submit assignment" is due');
    expect(afterDueSoon.items[0]?.targetUrl).toBe(`/tasks/hub?task=${task.id}`);

    // At deadlineAt -> exactly 1 overdue notification added
    clock.set('2026-10-30T10:02:00.000Z');
    expect((await notificationService.runReminderTick()).createdCount).toBe(1);
    expect((await notificationService.runReminderTick()).createdCount).toBe(0);

    const afterOverdue = await notificationService.listNotifications();
    expect(afterOverdue.items).toHaveLength(2);
    expect(afterOverdue.items[0]?.kind).toBe('overdue');
    expect(afterOverdue.items[0]?.title).toBe('Overdue');
    expect(afterOverdue.items[0]?.message).toContain('"Submit assignment" was due');
    expect(afterOverdue.items[1]?.kind).toBe('due_soon');
  });

  it('catches up safely after downtime without creating due_soon for an already-overdue task', async () => {
    await taskService.createTask({
      title: 'Missed while offline',
      deadlineAt: '2026-10-30T10:02:00.000Z',
    });

    // Simulate server offline across both reminderAt (10:01:30Z) and deadlineAt (10:02:00Z)
    clock.set('2026-10-30T10:15:00.000Z');
    const firstCatchUp = await notificationService.runReminderTick();
    const secondCatchUp = await notificationService.runReminderTick();

    expect(firstCatchUp.createdCount).toBe(1);
    expect(secondCatchUp.createdCount).toBe(0);

    const list = await notificationService.listNotifications();
    expect(list.items).toHaveLength(1);
    expect(list.items[0]?.kind).toBe('overdue');
  });

  it('reflects live task edits without copying data, toggles read state, and closes the loop on completion', async () => {
    const task = await taskService.createTask({
      title: 'Original title',
      deadlineAt: '2026-10-30T10:02:00.000Z',
    });

    clock.set('2026-10-30T10:01:35.000Z');
    await notificationService.runReminderTick();

    // Rename task -> notification DTO immediately reflects new title
    await taskService.updateTask(task.id, { title: 'Updated live title' });
    const listAfterRename = await notificationService.listNotifications();
    expect(listAfterRename.items[0]?.message).toContain('"Updated live title"');

    // Toggle read -> unread -> markAllRead
    const notifId = listAfterRename.items[0]!.id;
    const markedRead = await notificationService.markRead(notifId);
    expect(markedRead.isRead).toBe(true);
    expect((await notificationService.listNotifications()).unreadCount).toBe(0);

    const markedUnread = await notificationService.markUnread(notifId);
    expect(markedUnread.isRead).toBe(false);
    expect((await notificationService.listNotifications()).unreadCount).toBe(1);

    await notificationService.markAllRead();
    expect((await notificationService.listNotifications()).unreadCount).toBe(0);

    // Completing alerted task replaces due_soon with completed ("Nicely done")
    await taskService.completeTask(task.id);
    const listAfterComplete = await notificationService.listNotifications();
    expect(listAfterComplete.items).toHaveLength(1);
    expect(listAfterComplete.items[0]?.kind).toBe('completed');
    expect(listAfterComplete.items[0]?.title).toBe('Nicely done');
    expect(listAfterComplete.items[0]?.message).toBe('"Updated live title" is complete.');

    // Deleting task removes its notifications
    await taskService.deleteTask(task.id);
    expect((await notificationService.listNotifications()).items).toHaveLength(0);
  });

  it('purges notifications 7 days old or older from the database while keeping newer ones', async () => {
    await storage.notifications.saveItem({
      id: crypto.randomUUID(),
      kind: 'system',
      taskId: null,
      dedupeKey: 'system:old-8d',
      payload: { title: 'Old notice', message: 'Eight days old' },
      createdAt: '2026-10-22T10:00:00.000Z',
      readAt: null,
    });
    await storage.notifications.saveItem({
      id: crypto.randomUUID(),
      kind: 'system',
      taskId: null,
      dedupeKey: 'system:exact-7d',
      payload: { title: 'Exact cutoff', message: 'Seven days old' },
      createdAt: '2026-10-23T10:00:00.000Z',
      readAt: null,
    });
    const freshId = crypto.randomUUID();
    await storage.notifications.saveItem({
      id: freshId,
      kind: 'general',
      taskId: null,
      dedupeKey: 'general:fresh-2d',
      payload: { title: 'Recent note', message: 'Two days old' },
      createdAt: '2026-10-28T10:00:00.000Z',
      readAt: null,
    });

    // Clock is at 2026-10-30T10:00:00.000Z -> 7-day cutoff is 2026-10-23T10:00:00.000Z
    const deletedCount = await notificationService.purgeExpired();
    expect(deletedCount).toBe(2);

    const remainingDbRecords = await storage.notifications.listItems();
    expect(remainingDbRecords).toHaveLength(1);
    expect(remainingDbRecords[0]?.id).toBe(freshId);

    // Also verify relative age formatter
    expect(formatRelativeAgeLabel('2026-10-28T10:00:00.000Z', clock.now())).toBe('2 days ago');
    expect(formatRelativeAgeLabel('2026-10-30T09:59:40.000Z', clock.now())).toBe('Just now');
  });

  it('runs fallback tick only when stale beyond maxAgeMs', async () => {
    await taskService.createTask({
      title: 'Fallback check',
      deadlineAt: '2026-10-30T10:02:00.000Z',
    });

    // First call runs immediately because lastTickAt is null
    await notificationService.runReminderTickIfStale(15_000);

    // Advance past reminderAt by only 10s since last tick (< 15s) -> skipped
    clock.set('2026-10-30T10:00:10.000Z');
    await notificationService.runReminderTickIfStale(15_000);
    expect((await notificationService.listNotifications()).items).toHaveLength(0);

    // Advance past reminderAt AND > 15s since last tick -> runs and creates due_soon
    clock.set('2026-10-30T10:01:35.000Z');
    await notificationService.runReminderTickIfStale(15_000);
    expect((await notificationService.listNotifications()).items).toHaveLength(1);
  });
});
