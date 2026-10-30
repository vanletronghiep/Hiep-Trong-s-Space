import { differenceInMilliseconds, parseISO } from 'date-fns';
import type { Priority, TaskRecord } from '@/contracts';

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 0,
  normal: 1,
  optional: 2,
};

/**
 * Canonical task ordering within a single day column or Hub urgency group (§6.4):
 * 1. Completed tasks always last (ordered by completedAt ascending so newest completion lands at the bottom).
 * 2. Pinned tasks first.
 * 3. Priority: urgent → normal → optional.
 * 4. deadlineAt ascending.
 * 5. createdAt ascending (then id ascending as final deterministic tie-breaker).
 */
export function compareTasks(a: TaskRecord, b: TaskRecord): number {
  if (a.status !== b.status) {
    return a.status === 'active' ? -1 : 1;
  }

  if (a.status === 'completed' && b.status === 'completed') {
    if (a.completedAt && b.completedAt) {
      const completedDiff = differenceInMilliseconds(
        parseISO(a.completedAt),
        parseISO(b.completedAt),
      );
      if (completedDiff !== 0) {
        return completedDiff;
      }
    } else if (a.completedAt !== b.completedAt) {
      return a.completedAt === null ? -1 : 1;
    }
  }

  if (a.pinned !== b.pinned) {
    return a.pinned ? -1 : 1;
  }

  const priorityDiff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const deadlineDiff = differenceInMilliseconds(parseISO(a.deadlineAt), parseISO(b.deadlineAt));
  if (deadlineDiff !== 0) {
    return deadlineDiff;
  }

  const createdDiff = differenceInMilliseconds(parseISO(a.createdAt), parseISO(b.createdAt));
  if (createdDiff !== 0) {
    return createdDiff;
  }

  return a.id.localeCompare(b.id);
}

export function sortTasks<T extends TaskRecord>(tasks: readonly T[]): T[] {
  return [...tasks].sort(compareTasks);
}
