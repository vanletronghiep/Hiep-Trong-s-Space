import { addDays, format, parseISO } from 'date-fns';
import { TZDate } from '@date-fns/tz';

export const DEFAULT_APP_TIMEZONE = 'Asia/Saigon';

function toZonedDate(instant: Date | string, timeZone: string): TZDate {
  const baseDate = typeof instant === 'string' ? parseISO(instant) : instant;
  return new TZDate(baseDate.getTime(), timeZone);
}

/**
 * Formats an instant into 'YYYY-MM-DD' in the given timezone.
 */
export function formatScheduledDate(
  instant: Date | string,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): string {
  return format(toZonedDate(instant, timeZone), 'yyyy-MM-dd');
}

/**
 * Formats an instant as 'DD/MM' when in the same calendar year as `referenceNow`
 * (evaluated in `timeZone`), or 'DD/MM/YYYY' for a different year.
 */
export function formatDisplayDate(
  instant: Date | string,
  referenceNow: Date,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): string {
  const target = toZonedDate(instant, timeZone);
  const current = toZonedDate(referenceNow, timeZone);
  const pattern = target.getFullYear() === current.getFullYear() ? 'dd/MM' : 'dd/MM/yyyy';
  return format(target, pattern);
}

/**
 * Formats an instant as 'DD/MM HH:mm' (or 'DD/MM/YYYY HH:mm' if outside current year).
 */
export function formatDisplayDateTime(
  instant: Date | string,
  referenceNow: Date,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): string {
  const target = toZonedDate(instant, timeZone);
  const datePart = formatDisplayDate(instant, referenceNow, timeZone);
  return `${datePart} ${format(target, 'HH:mm')}`;
}

/**
 * Combines a 'YYYY-MM-DD' calendar date and 'HH:mm' 24h time in `timeZone`
 * and returns a canonical UTC ISO-8601 instant string.
 */
export function buildZonedInstant(
  scheduledDate: string,
  timeHm: string,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): string {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(scheduledDate);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeHm);
  if (!dateMatch || !timeMatch) {
    throw new RangeError(`Invalid date/time input: "${scheduledDate}" "${timeHm}"`);
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new RangeError(`Out-of-range date/time input: "${scheduledDate}" "${timeHm}"`);
  }

  const zoned = new TZDate(year, month - 1, day, hour, minute, 0, 0, timeZone);
  // Reject non-existent calendar dates such as 2026-02-30 that roll over into March.
  if (zoned.getFullYear() !== year || zoned.getMonth() !== month - 1 || zoned.getDate() !== day) {
    throw new RangeError(`Non-existent calendar date: "${scheduledDate}"`);
  }

  return new Date(zoned.getTime()).toISOString();
}

/**
 * Shifts a 'YYYY-MM-DD' date by `deltaDays` within `timeZone`.
 */
export function shiftScheduledDate(
  scheduledDate: string,
  deltaDays: number,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): string {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(scheduledDate);
  if (!dateMatch) {
    throw new RangeError(`Invalid scheduledDate: "${scheduledDate}"`);
  }
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  // Use noon in the target timezone so DST transitions (if another timezone is configured) cannot skip/repeat a day.
  const anchor = new TZDate(year, month - 1, day, 12, 0, 0, 0, timeZone);
  return format(addDays(anchor, deltaDays), 'yyyy-MM-dd');
}
