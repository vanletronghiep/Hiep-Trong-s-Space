import { differenceInMilliseconds, parseISO } from 'date-fns';
import type {
  NotificationDto,
  NotificationKind,
  NotificationRecord,
  TaskRecord,
} from '@/contracts';
import { deriveTaskState } from './task-status';
import { DEFAULT_APP_TIMEZONE, formatDisplayDateTime } from './time';

export const NOTIFICATION_TAG_LABELS: Record<NotificationKind, string> = {
  due_soon: 'Due soon',
  overdue: 'Overdue',
  completed: 'Completed',
  general: 'General',
  system: 'System',
};

export interface ReminderCandidate {
  kind: 'due_soon' | 'overdue';
  taskId: string;
  dedupeKey: string;
}

/**
 * Evaluates whether an active task currently requires a `due_soon` or `overdue` notification (§6.9).
 * Catch-up safety: if a task is already overdue (`deadlineAt <= now`), it emits ONLY `overdue` and never `due_soon`.
 */
export function evaluateTaskReminderCandidate(
  task: TaskRecord,
  now: Date,
): ReminderCandidate | null {
  if (task.status !== 'active') {
    return null;
  }

  const deadlineMs = differenceInMilliseconds(parseISO(task.deadlineAt), now);
  if (deadlineMs <= 0) {
    return {
      kind: 'overdue',
      taskId: task.id,
      dedupeKey: `task:${task.id}:overdue:${task.deadlineAt}`,
    };
  }

  if (task.reminderAt !== null && differenceInMilliseconds(parseISO(task.reminderAt), now) <= 0) {
    return {
      kind: 'due_soon',
      taskId: task.id,
      dedupeKey: `task:${task.id}:due_soon:${task.deadlineAt}`,
    };
  }

  return null;
}

/**
 * Builds a live NotificationDto by joining a NotificationRecord with its live TaskRecord (§6.9).
 * Returns null if a task-linked notification's task no longer exists.
 */
export function buildNotificationDto(options: {
  record: NotificationRecord;
  task: TaskRecord | null;
  now: Date;
  timeZone?: string;
}): NotificationDto | null {
  const { record, task, now, timeZone = DEFAULT_APP_TIMEZONE } = options;
  const tagLabel = NOTIFICATION_TAG_LABELS[record.kind];
  const isRead = record.readAt !== null;

  if (record.kind === 'general' || record.kind === 'system') {
    return {
      id: record.id,
      kind: record.kind,
      tagLabel,
      title: record.payload?.title ?? tagLabel,
      message: record.payload?.message ?? '',
      isRead,
      createdAt: record.createdAt,
      timeLeftMs: null,
      taskId: null,
      targetUrl: null,
    };
  }

  if (!task) {
    return null;
  }

  const formattedDeadline = formatDisplayDateTime(task.deadlineAt, now, timeZone);
  const derived = deriveTaskState(task, now);

  let title = tagLabel;
  let message = '';
  let timeLeftMs: number | null = null;

  if (record.kind === 'due_soon') {
    title = 'Due soon';
    message = `"${task.title}" is due ${formattedDeadline}.`;
    timeLeftMs = task.status === 'active' ? derived.timeLeftMs : null;
  } else if (record.kind === 'overdue') {
    title = 'Overdue';
    message = `"${task.title}" was due ${formattedDeadline}.`;
    timeLeftMs = task.status === 'active' ? derived.timeLeftMs : null;
  } else if (record.kind === 'completed') {
    title = 'Nicely done';
    message = `"${task.title}" is complete.`;
    timeLeftMs = null;
  }

  return {
    id: record.id,
    kind: record.kind,
    tagLabel,
    title,
    message,
    isRead,
    createdAt: record.createdAt,
    timeLeftMs,
    taskId: task.id,
    targetUrl: `/tasks/hub?task=${task.id}`,
  };
}

/**
 * Formats the bottom-right notification age label ("Just now", "2 hours ago", "3 days ago") (§9.11 & §15.3).
 */
export function formatRelativeAgeLabel(createdAt: string, now: Date): string {
  const elapsedMs = Math.max(0, differenceInMilliseconds(now, parseISO(createdAt)));
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
