import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const tasksTable = sqliteTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    priority: text('priority', { enum: ['urgent', 'normal', 'optional'] }).notNull(),
    pinned: integer('pinned', { mode: 'boolean' }).notNull(),
    deadlineAt: text('deadline_at').notNull(),
    scheduledDate: text('scheduled_date'),
    status: text('status', { enum: ['active', 'completed'] }).notNull(),
    completedAt: text('completed_at'),
    reminderAt: text('reminder_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('tasks_status_scheduled_date_idx').on(table.status, table.scheduledDate),
    index('tasks_status_deadline_at_idx').on(table.status, table.deadlineAt),
    index('tasks_reminder_at_idx').on(table.reminderAt),
  ],
);

export const notificationsTable = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    kind: text('kind', {
      enum: ['due_soon', 'overdue', 'completed', 'general', 'system'],
    }).notNull(),
    taskId: text('task_id').references(() => tasksTable.id, { onDelete: 'cascade' }),
    dedupeKey: text('dedupe_key').notNull(),
    payload: text('payload'),
    createdAt: text('created_at').notNull(),
    readAt: text('read_at'),
  },
  (table) => [
    uniqueIndex('notifications_dedupe_key_uidx').on(table.dedupeKey),
    index('notifications_task_id_idx').on(table.taskId),
    index('notifications_created_at_idx').on(table.createdAt),
  ],
);
