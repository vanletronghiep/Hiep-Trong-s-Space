import { addMilliseconds, differenceInMilliseconds, parseISO } from 'date-fns';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Computes the Due Soon reminder timestamp (§6.5):
 * - remaining <= 0   -> null (already overdue)
 * - remaining >= 24h -> deadlineAt - 24h
 * - 0 < remaining < 24h -> deadlineAt - remaining / 4 (i.e. notify when 1/4 of remaining time is left)
 */
export function computeReminderAt(deadlineAt: string, referenceNow: Date): string | null {
  const deadline = parseISO(deadlineAt);
  const remainingMs = differenceInMilliseconds(deadline, referenceNow);

  if (remainingMs <= 0) {
    return null;
  }

  if (remainingMs >= TWENTY_FOUR_HOURS_MS) {
    return addMilliseconds(deadline, -TWENTY_FOUR_HOURS_MS).toISOString();
  }

  const leadTimeMs = Math.round(remainingMs / 4);
  return addMilliseconds(deadline, -leadTimeMs).toISOString();
}
