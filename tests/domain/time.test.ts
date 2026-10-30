import { describe, expect, it } from 'vitest';
import type { Clock } from '@/domain/clock';
import {
  buildZonedInstant,
  formatDisplayDate,
  formatDisplayDateTime,
  formatScheduledDate,
  shiftScheduledDate,
} from '@/domain/time';

function createFakeClock(isoInstant: string): Clock {
  return {
    now: () => new Date(isoInstant),
  };
}

describe('domain/time', () => {
  it('formats scheduled date in Asia/Saigon across UTC midnight boundary', () => {
    // 2026-10-29T18:30:00Z is 2026-10-30 01:30:00 in Asia/Saigon (UTC+7)
    expect(formatScheduledDate('2026-10-29T18:30:00.000Z', 'Asia/Saigon')).toBe('2026-10-30');
    // 2026-10-29T16:59:59Z is 2026-10-29 23:59:59 in Asia/Saigon
    expect(formatScheduledDate('2026-10-29T16:59:59.000Z', 'Asia/Saigon')).toBe('2026-10-29');
  });

  it('omits year in display format when within current year and includes year otherwise', () => {
    const clock = createFakeClock('2026-10-30T03:00:00.000Z'); // 2026-10-30 10:00 ICT
    const sameYearInstant = '2026-12-31T16:59:00.000Z'; // 2026-12-31 23:59 ICT
    const nextYearInstant = '2026-12-31T17:00:00.000Z'; // 2027-01-01 00:00 ICT

    expect(formatDisplayDate(sameYearInstant, clock.now(), 'Asia/Saigon')).toBe('31/12');
    expect(formatDisplayDateTime(sameYearInstant, clock.now(), 'Asia/Saigon')).toBe('31/12 23:59');

    expect(formatDisplayDate(nextYearInstant, clock.now(), 'Asia/Saigon')).toBe('01/01/2027');
    expect(formatDisplayDateTime(nextYearInstant, clock.now(), 'Asia/Saigon')).toBe(
      '01/01/2027 00:00',
    );
  });

  it('builds UTC instant from YYYY-MM-DD and HH:mm in Asia/Saigon', () => {
    // 2026-10-30 23:59 Asia/Saigon -> 2026-10-30T16:59:00.000Z
    expect(buildZonedInstant('2026-10-30', '23:59', 'Asia/Saigon')).toBe(
      '2026-10-30T16:59:00.000Z',
    );
  });

  it('handles leap day and rejects non-existent calendar dates', () => {
    expect(buildZonedInstant('2028-02-29', '09:00', 'Asia/Saigon')).toBe(
      '2028-02-29T02:00:00.000Z',
    );
    expect(() => buildZonedInstant('2026-02-29', '09:00', 'Asia/Saigon')).toThrow(RangeError);
    expect(() => buildZonedInstant('2026-10-30', '24:00', 'Asia/Saigon')).toThrow(RangeError);
  });

  it('shifts scheduled dates across month, leap-year, and year boundaries', () => {
    expect(shiftScheduledDate('2026-12-31', 1, 'Asia/Saigon')).toBe('2027-01-01');
    expect(shiftScheduledDate('2027-01-01', -1, 'Asia/Saigon')).toBe('2026-12-31');
    expect(shiftScheduledDate('2028-02-28', 1, 'Asia/Saigon')).toBe('2028-02-29');
    expect(shiftScheduledDate('2026-02-28', 1, 'Asia/Saigon')).toBe('2026-03-01');
  });
});
