import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Clock } from '@/domain/clock';
import { NotFoundError, ValidationError } from '@/services/errors';
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

describe('TaskService (§6.7)', () => {
  let tempDir: string;
  let storage: StorageAdapter;
  let clock: MutableClock;
  let service: TaskService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hts-task-service-'));
    storage = createStorageAdapter({
      storageDriver: 'local',
      databasePath: path.join(tempDir, 'tasks.db'),
      mediaDir: path.join(tempDir, 'media'),
      googleDriveFolderId: '',
    });
    await storage.init();
    clock = new MutableClock('2026-10-30T03:00:00.000Z'); // 10:00 ICT
    service = new TaskService({ storage, clock });
  });

  afterEach(async () => {
    await storage.close();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('creates a task with computed reminderAt and rejects past deadlines on creation', async () => {
    await expect(
      service.createTask({
        title: 'Past task',
        deadlineAt: '2026-10-30T02:59:00.000Z',
        scheduledDate: '2026-10-30',
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    // 12h remaining -> reminderAt = deadline - 3h
    const created = await service.createTask({
      title: '  Finish architecture spec  ',
      description: 'Read agent_readme carefully',
      priority: 'urgent',
      pinned: true,
      deadlineAt: '2026-10-30T15:00:00.000Z',
      scheduledDate: '2026-10-30',
    });

    expect(created.title).toBe('Finish architecture spec');
    expect(created.reminderAt).toBe('2026-10-30T12:00:00.000Z');
    expect(created.isOverdue).toBe(false);
    expect(created.isDueSoon).toBe(false);

    // Advance clock past reminderAt -> isDueSoon becomes true
    clock.set('2026-10-30T12:30:00.000Z');
    const fetched = await service.getTask(created.id);
    expect(fetched.isDueSoon).toBe(true);
    expect(fetched.isOverdue).toBe(false);
  });

  it('updates deadlineAt, recomputes reminderAt, removes stale alerts, and permits past deadline edits on existing tasks', async () => {
    const task = await service.createTask({
      title: 'Draft report',
      deadlineAt: '2026-10-31T03:00:00.000Z',
      scheduledDate: '2026-10-31',
    });

    // Seed a due_soon notification for this task
    await storage.notifications.saveItem({
      id: crypto.randomUUID(),
      kind: 'due_soon',
      taskId: task.id,
      dedupeKey: `task:${task.id}:due_soon:${task.deadlineAt}`,
      payload: null,
      createdAt: clock.now().toISOString(),
      readAt: null,
    });

    // Update deadline into the past (allowed for existing tasks per §6.7)
    const edited = await service.updateTask(task.id, {
      deadlineAt: '2026-10-30T01:00:00.000Z',
    });

    expect(edited.isOverdue).toBe(true);
    expect(edited.reminderAt).toBeNull();

    // Stale due_soon notification was purged
    const remainingNotifs = await storage.notifications.listItems({ taskId: task.id });
    expect(remainingNotifs).toHaveLength(0);
  });

  it('completes silently when no alert existed, or replaces due_soon/overdue with one completed notification, and uncompletes cleanly', async () => {
    const quietTask = await service.createTask({
      title: 'Quiet task',
      deadlineAt: '2026-11-02T10:00:00.000Z',
    });
    const completedQuiet = await service.completeTask(quietTask.id);
    expect(completedQuiet.status).toBe('completed');
    expect(completedQuiet.reminderAt).toBeNull();
    expect(await storage.notifications.listItems({ taskId: quietTask.id })).toHaveLength(0);

    const alertedTask = await service.createTask({
      title: 'Alerted task',
      deadlineAt: '2026-10-30T15:00:00.000Z',
    });
    await storage.notifications.saveItem({
      id: crypto.randomUUID(),
      kind: 'due_soon',
      taskId: alertedTask.id,
      dedupeKey: `task:${alertedTask.id}:due_soon:${alertedTask.deadlineAt}`,
      payload: null,
      createdAt: clock.now().toISOString(),
      readAt: null,
    });

    clock.set('2026-10-30T13:00:00.000Z');
    await service.completeTask(alertedTask.id);

    const notifsAfterComplete = await storage.notifications.listItems({ taskId: alertedTask.id });
    expect(notifsAfterComplete).toHaveLength(1);
    expect(notifsAfterComplete[0]?.kind).toBe('completed');

    // Uncompleting restores active status and recomputes reminderAt
    const uncompleted = await service.uncompleteTask(alertedTask.id);
    expect(uncompleted.status).toBe('active');
    expect(uncompleted.completedAt).toBeNull();
    expect(uncompleted.reminderAt).toBe('2026-10-30T14:30:00.000Z'); // 2h left -> 30m before
  });

  it('transfers an overdue task by setting both scheduledDate and future deadlineAt, rejecting past transfers', async () => {
    const task = await service.createTask({
      title: 'Overdue reading',
      deadlineAt: '2026-10-30T04:00:00.000Z',
      scheduledDate: '2026-10-30',
    });

    clock.set('2026-10-30T06:00:00.000Z');
    expect((await service.getTask(task.id)).isOverdue).toBe(true);

    // Reject transfer into the past
    await expect(
      service.transferTask(task.id, {
        scheduledDate: '2026-10-30',
        deadlineAt: '2026-10-30T05:59:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    // Transfer to tomorrow
    const transferred = await service.transferTask(task.id, {
      scheduledDate: '2026-10-31',
      deadlineAt: '2026-10-31T16:59:00.000Z',
    });
    expect(transferred.scheduledDate).toBe('2026-10-31');
    expect(transferred.isOverdue).toBe(false);
    expect(transferred.reminderAt).toBe('2026-10-30T16:59:00.000Z');
  });

  it('deletes tasks and throws NotFoundError on missing task ids', async () => {
    const task = await service.createTask({
      title: 'Disposable task',
      deadlineAt: '2026-10-31T10:00:00.000Z',
    });

    await service.deleteTask(task.id);
    await expect(service.getTask(task.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
