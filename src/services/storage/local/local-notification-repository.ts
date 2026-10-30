import { and, desc, eq, inArray, isNull, lte, type SQL } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import {
  notificationPayloadSchema,
  notificationRecordSchema,
  type NotificationDeleteFilter,
  type NotificationPayload,
  type NotificationQuery,
  type NotificationRecord,
} from '@/contracts';
import { ConflictError } from '@/services/errors';
import type { NotificationRepository } from '../storage-adapter';
import { notificationsTable } from './schema';

type NotificationRow = typeof notificationsTable.$inferSelect;

function parsePayload(raw: string | null): NotificationPayload | null {
  if (raw === null) {
    return null;
  }
  const parsed: unknown = JSON.parse(raw);
  return notificationPayloadSchema.parse(parsed);
}

function rowToNotificationRecord(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    kind: row.kind,
    taskId: row.taskId,
    dedupeKey: row.dedupeKey,
    payload: parsePayload(row.payload),
    createdAt: row.createdAt,
    readAt: row.readAt,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const code = 'code' in error ? error.code : undefined;
  return code === 'SQLITE_CONSTRAINT_UNIQUE';
}

export class LocalNotificationRepository implements NotificationRepository {
  private readonly getDb: () => BetterSQLite3Database;

  constructor(getDb: () => BetterSQLite3Database) {
    this.getDb = getDb;
  }

  async saveItem(record: NotificationRecord): Promise<NotificationRecord> {
    const validated = notificationRecordSchema.parse(record);
    const db = this.getDb();
    const serializedPayload = validated.payload !== null ? JSON.stringify(validated.payload) : null;

    try {
      db.insert(notificationsTable)
        .values({
          id: validated.id,
          kind: validated.kind,
          taskId: validated.taskId,
          dedupeKey: validated.dedupeKey,
          payload: serializedPayload,
          createdAt: validated.createdAt,
          readAt: validated.readAt,
        })
        .onConflictDoUpdate({
          target: notificationsTable.id,
          set: {
            kind: validated.kind,
            taskId: validated.taskId,
            dedupeKey: validated.dedupeKey,
            payload: serializedPayload,
            createdAt: validated.createdAt,
            readAt: validated.readAt,
          },
        })
        .run();
    } catch (error: unknown) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError(
          `Notification with dedupeKey "${validated.dedupeKey}" already exists`,
        );
      }
      throw error;
    }

    return validated;
  }

  async getItem(id: string): Promise<NotificationRecord | null> {
    const db = this.getDb();
    const row = db.select().from(notificationsTable).where(eq(notificationsTable.id, id)).get();
    return row ? rowToNotificationRecord(row) : null;
  }

  async listItems(query?: NotificationQuery): Promise<NotificationRecord[]> {
    if (query?.kinds !== undefined && query.kinds.length === 0) {
      return [];
    }

    const db = this.getDb();
    const conditions: SQL[] = [];

    if (query?.taskId !== undefined) {
      conditions.push(eq(notificationsTable.taskId, query.taskId));
    }
    if (query?.kinds !== undefined) {
      conditions.push(inArray(notificationsTable.kind, query.kinds));
    }
    if (query?.unreadOnly === true) {
      conditions.push(isNull(notificationsTable.readAt));
    }

    const baseQuery = db.select().from(notificationsTable);
    const filteredQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;
    const rows = filteredQuery
      .orderBy(desc(notificationsTable.createdAt), desc(notificationsTable.id))
      .all();

    return rows.map(rowToNotificationRecord);
  }

  async deleteItem(id: string): Promise<void> {
    const db = this.getDb();
    db.delete(notificationsTable).where(eq(notificationsTable.id, id)).run();
  }

  async deleteWhere(filter: NotificationDeleteFilter): Promise<number> {
    if (filter.kinds !== undefined && filter.kinds.length === 0) {
      return 0;
    }

    const conditions: SQL[] = [];
    if (filter.taskId !== undefined) {
      conditions.push(eq(notificationsTable.taskId, filter.taskId));
    }
    if (filter.kinds !== undefined) {
      conditions.push(inArray(notificationsTable.kind, filter.kinds));
    }
    if (filter.createdAtOnOrBefore !== undefined) {
      conditions.push(lte(notificationsTable.createdAt, filter.createdAtOnOrBefore));
    }

    if (conditions.length === 0) {
      return 0;
    }

    const db = this.getDb();
    const result = db
      .delete(notificationsTable)
      .where(and(...conditions))
      .run();
    return result.changes;
  }
}
