import {
  addDays,
  differenceInMilliseconds,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { buildZonedInstant, DEFAULT_APP_TIMEZONE, formatScheduledDate } from './time';

export interface ResolvedDateInput {
  scheduledDate: string; // YYYY-MM-DD
  displayInput: string; // DD/MM or DD/MM/YYYY
  humanLabel: string; // e.g. 'Friday, 30 Oct 2026'
}

function isValidCalendarDay(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1970 || year > 2100) {
    return false;
  }
  const probe = new TZDate(year, month - 1, day, 12, 0, 0, 0, 'UTC');
  return probe.getFullYear() === year && probe.getMonth() === month - 1 && probe.getDate() === day;
}

function toHumanLabel(scheduledDate: string, timeZone: string): string {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(scheduledDate);
  if (!parts) {
    return scheduledDate;
  }
  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const zoned = new TZDate(year, month - 1, day, 12, 0, 0, 0, timeZone);
  return format(zoned, 'EEEE, dd MMM yyyy');
}

/**
 * Resolves user date text ('DD/MM', 'DD/MM/YYYY', or 'YYYY-MM-DD') against `referenceNow` in `timeZone`.
 * When year is omitted ('DD/MM'), selects the nearest valid calendar occurrence on or after today (§9.2).
 */
export function resolveDateInput(
  rawInput: string,
  referenceNow: Date,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): ResolvedDateInput | null {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  const todayStr = formatScheduledDate(referenceNow, timeZone);
  const todayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayStr);
  const currentYear = todayMatch ? Number(todayMatch[1]) : referenceNow.getUTCFullYear();

  // Case 1: ISO YYYY-MM-DD (from native date picker)
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidCalendarDay(year, month, day)) {
      return null;
    }
    const scheduledDate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const displayInput =
      year === currentYear
        ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
        : `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    return {
      scheduledDate,
      displayInput,
      humanLabel: toHumanLabel(scheduledDate, timeZone),
    };
  }

  // Case 2: DD/MM or DD/MM/YYYY
  const slashMatch = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/.exec(trimmed);
  if (!slashMatch) {
    return null;
  }

  const day = Number(slashMatch[1]);
  const month = Number(slashMatch[2]);
  const explicitYear = slashMatch[3] ? Number(slashMatch[3]) : null;

  if (explicitYear !== null) {
    if (!isValidCalendarDay(explicitYear, month, day)) {
      return null;
    }
    const scheduledDate = `${explicitYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return {
      scheduledDate,
      displayInput:
        explicitYear === currentYear
          ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
          : `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${explicitYear}`,
      humanLabel: toHumanLabel(scheduledDate, timeZone),
    };
  }

  // Search up to 8 years ahead so 29/02 resolves cleanly to the next leap year on or after today
  for (let offset = 0; offset <= 8; offset += 1) {
    const candidateYear = currentYear + offset;
    if (!isValidCalendarDay(candidateYear, month, day)) {
      continue;
    }
    const candidateDate = `${candidateYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (candidateDate >= todayStr) {
      return {
        scheduledDate: candidateDate,
        displayInput:
          candidateYear === currentYear
            ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
            : `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${candidateYear}`,
        humanLabel: toHumanLabel(candidateDate, timeZone),
      };
    }
  }

  return null;
}

export function isValidTimeHm(rawTime: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(rawTime.trim());
  if (!match) {
    return false;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function extractZonedDateAndTime(
  isoInstant: string,
  referenceNow: Date,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): { dateInput: string; scheduledDate: string; timeHm: string } {
  const parsed = parseISO(isoInstant);
  const zoned = new TZDate(parsed.getTime(), timeZone);
  const nowZoned = new TZDate(referenceNow.getTime(), timeZone);
  const scheduledDate = format(zoned, 'yyyy-MM-dd');
  const dateInput =
    zoned.getFullYear() === nowZoned.getFullYear()
      ? format(zoned, 'dd/MM')
      : format(zoned, 'dd/MM/yyyy');
  const timeHm = format(zoned, 'HH:mm');
  return { dateInput, scheduledDate, timeHm };
}

export function isFutureInstant(isoInstant: string, now: Date): boolean {
  return differenceInMilliseconds(parseISO(isoInstant), now) > 0;
}

export function buildDeadlineFromInputs(options: {
  dateInput: string;
  timeInput: string;
  referenceNow: Date;
  timeZone?: string;
}):
  | { ok: true; scheduledDate: string; deadlineAt: string }
  | { ok: false; field: 'date' | 'time'; message: string } {
  const timeZone = options.timeZone ?? DEFAULT_APP_TIMEZONE;
  const resolved = resolveDateInput(options.dateInput, options.referenceNow, timeZone);
  if (!resolved) {
    return {
      ok: false,
      field: 'date',
      message: 'Enter a valid date as DD/MM (for example 30/10).',
    };
  }
  const trimmedTime = options.timeInput.trim();
  if (!isValidTimeHm(trimmedTime)) {
    return {
      ok: false,
      field: 'time',
      message: 'Enter a valid 24-hour time as HH:mm (for example 23:59).',
    };
  }

  const deadlineAt = buildZonedInstant(resolved.scheduledDate, trimmedTime, timeZone);
  return {
    ok: true,
    scheduledDate: resolved.scheduledDate,
    deadlineAt,
  };
}

/**
 * Returns the 7 YYYY-MM-DD dates (Monday to Sunday) for the week containing `anchorDateStr`.
 */
export function getWeekDates(
  anchorDateStr: string,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): string[] {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(anchorDateStr);
  if (!parts) {
    return [];
  }
  const anchor = new TZDate(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    12,
    0,
    0,
    0,
    timeZone,
  );
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, idx) => format(addDays(weekStart, idx), 'yyyy-MM-dd'));
}

export interface MonthCalendarCell {
  scheduledDate: string;
  dayNumber: number;
  inCurrentMonth: boolean;
}

/**
 * Returns the Monday-aligned calendar grid cells covering the month of `anchorDateStr`.
 */
export function getMonthCalendarCells(
  anchorDateStr: string,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): { monthLabel: string; cells: MonthCalendarCell[] } {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(anchorDateStr);
  if (!parts) {
    return { monthLabel: '', cells: [] };
  }
  const year = Number(parts[1]);
  const monthIndex = Number(parts[2]) - 1;
  const anchor = new TZDate(year, monthIndex, 15, 12, 0, 0, 0, timeZone);
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  return {
    monthLabel: format(anchor, 'MMMM yyyy'),
    cells: days.map((d) => ({
      scheduledDate: format(d, 'yyyy-MM-dd'),
      dayNumber: d.getDate(),
      inCurrentMonth: d.getMonth() === monthIndex,
    })),
  };
}

export function formatDayColumnHeader(
  scheduledDate: string,
  timeZone: string = DEFAULT_APP_TIMEZONE,
): { weekday: string; shortWeekday: string; dayMonth: string } {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(scheduledDate);
  if (!parts) {
    return { weekday: scheduledDate, shortWeekday: scheduledDate, dayMonth: '' };
  }
  const zoned = new TZDate(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    12,
    0,
    0,
    0,
    timeZone,
  );
  return {
    weekday: format(zoned, 'EEEE'),
    shortWeekday: format(zoned, 'EEE'),
    dayMonth: format(zoned, 'dd/MM'),
  };
}
