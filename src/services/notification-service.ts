import { addDays, differenceInMilliseconds } from 'date-fns';
import type {
  NotificationDto,
  NotificationListResponse,
  NotificationRecord,
  TaskRecord,
} from '@/contracts';
import type { Clock } from '@/domain/clock';
import { buildNotificationDto, evaluateTaskReminderCandidate } from '@/domain/notification-rules';
import { DEFAULT_APP_TIMEZONE } from '@/domain/time';
import { ConflictError, NotFoundError } from './errors';
import type { StorageAdapter } from './storage/storage-adapter';

const RETENTION_DAYS = 7;

export class NotificationService {
  private readonly storage: StorageAdapter;
  private readonly clock: Clock;
  private readonly timeZone: string;
  private lastTickAt: Date | null = null;

  constructor(deps: { storage: StorageAdapter; clock: Clock; timeZone?: string }) {
    this.storage = deps.storage;
    this.clock = deps.clock;
    this.timeZone = deps.timeZone ?? DEFAULT_APP_TIMEZONE;
  }

  async runReminderTick(): Promise<{ createdCount: number }> {
    const now = this.clock.now();
    this.lastTickAt = now;
    const nowIso = now.toISOString();

    const [activeTasks, existingAlerts] = await Promise.all([
      this.storage.tasks.listItems({ status: 'active' }),
      this.storage.notifications.listItems({ kinds: ['due_soon', 'overdue'] }),
    ]);

    const existingDedupeKeys = new Set(existingAlerts.map((n) => n.dedupeKey));
    let createdCount = 0;

    for (const task of activeTasks) {
      const candidate = evaluateTaskReminderCandidate(task, now);
      if (!candidate || existingDedupeKeys.has(candidate.dedupeKey)) {
        continue;
      }

      const record: NotificationRecord = {
        id: crypto.randomUUID(),
        kind: candidate.kind,
        taskId: candidate.taskId,
        dedupeKey: candidate.dedupeKey,
        payload: null,
        createdAt: nowIso,
        readAt: null,
      };

      try {
        await this.storage.notifications.saveItem(record);
        existingDedupeKeys.add(candidate.dedupeKey);
        createdCount += 1;
      } catch (error: unknown) {
        if (!(error instanceof ConflictError)) {
          throw error;
        }
      }
    }

    return { createdCount };
  }

  async runReminderTickIfStale(maxAgeMs: number = 15_000): Promise<void> {
    const now = this.clock.now();
    if (this.lastTickAt === null || differenceInMilliseconds(now, this.lastTickAt) > maxAgeMs) {
      await this.runReminderTick();
    }
  }

  async purgeExpired(): Promise<number> {
    const now = this.clock.now();
    const cutoffIso = addDays(now, -RETENTION_DAYS).toISOString();
    return this.storage.notifications.deleteWhere({
      createdAtOnOrBefore: cutoffIso,
    });
  }

  async listNotifications(): Promise<NotificationListResponse> {
    const now = this.clock.now();
    const [records, tasks] = await Promise.all([
      this.storage.notifications.listItems(),
      this.storage.tasks.listItems(),
    ]);

    const taskMap = new Map<string, TaskRecord>();
    for (const task of tasks) {
      taskMap.set(task.id, task);
    }

    const items: NotificationDto[] = [];
    for (const record of records) {
      const linkedTask = record.taskId ? (taskMap.get(record.taskId) ?? null) : null;
      const dto = buildNotificationDto({
        record,
        task: linkedTask,
        now,
        timeZone: this.timeZone,
      });
      if (dto) {
        items.push(dto);
      }
    }

    const unreadCount = items.filter((item) => !item.isRead).length;
    return { items, unreadCount };
  }

  async markRead(id: string): Promise<NotificationDto> {
    return this.setReadState(id, true);
  }

  async markUnread(id: string): Promise<NotificationDto> {
    return this.setReadState(id, false);
  }

  private async setReadState(id: string, isRead: boolean): Promise<NotificationDto> {
    const existing = await this.storage.notifications.getItem(id);
    if (!existing) {
      throw new NotFoundError('Notification not found.');
    }

    const now = this.clock.now();
    const updated: NotificationRecord = {
      ...existing,
      readAt: isRead ? (existing.readAt ?? now.toISOString()) : null,
    };

    const saved = await this.storage.notifications.saveItem(updated);
    const linkedTask = saved.taskId ? await this.storage.tasks.getItem(saved.taskId) : null;
    const dto = buildNotificationDto({
      record: saved,
      task: linkedTask,
      now,
      timeZone: this.timeZone,
    });

    if (!dto) {
      throw new NotFoundError('Linked task for notification no longer exists.');
    }
    return dto;
  }

  async markAllRead(): Promise<{ updatedCount: number }> {
    const unread = await this.storage.notifications.listItems({ unreadOnly: true });
    if (unread.length === 0) {
      return { updatedCount: 0 };
    }

    const nowIso = this.clock.now().toISOString();
    for (const item of unread) {
      await this.storage.notifications.saveItem({
        ...item,
        readAt: nowIso,
      });
    }
    return { updatedCount: unread.length };
  }
}
