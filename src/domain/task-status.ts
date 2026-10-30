import { differenceInMilliseconds, parseISO } from 'date-fns';
import type { TaskDto, TaskRecord } from '@/contracts';

export interface DerivedTaskState {
  isOverdue: boolean;
  isDueSoon: boolean;
  timeLeftMs: number;
}

export function deriveTaskState(
  task: Pick<TaskRecord, 'status' | 'deadlineAt' | 'reminderAt'>,
  now: Date,
): DerivedTaskState {
  const deadline = parseISO(task.deadlineAt);
  const timeLeftMs = differenceInMilliseconds(deadline, now);
  const isOverdue = task.status === 'active' && timeLeftMs <= 0;
  const isDueSoon =
    task.status === 'active' &&
    !isOverdue &&
    task.reminderAt !== null &&
    differenceInMilliseconds(parseISO(task.reminderAt), now) <= 0;

  return {
    isOverdue,
    isDueSoon,
    timeLeftMs,
  };
}

export function toTaskDto(task: TaskRecord, now: Date): TaskDto {
  const derived = deriveTaskState(task, now);
  return {
    ...task,
    ...derived,
  };
}

function formatDurationCompact(absMs: number): string {
  const totalMinutes = Math.floor(absMs / 60_000);
  if (totalMinutes < 1) {
    return '<1m';
  }
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export function formatTimeLeftLabel(timeLeftMs: number, isOverdue: boolean): string {
  if (isOverdue || timeLeftMs <= 0) {
    return `Overdue by ${formatDurationCompact(Math.abs(timeLeftMs))}`;
  }
  return `${formatDurationCompact(timeLeftMs)} left`;
}
