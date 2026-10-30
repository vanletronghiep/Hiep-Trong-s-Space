import { describe, expect, it } from 'vitest';
import type { TaskRecord } from '@/contracts';
import {
  buildDeadlineFromInputs,
  getMonthCalendarCells,
  getWeekDates,
  resolveDateInput,
} from '@/domain/date-input';
import { computeReminderAt } from '@/domain/reminder';
import { sortTasks } from '@/domain/task-sort';
import { deriveTaskState, formatTimeLeftLabel } from '@/domain/task-status';

function makeTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Sample task',
    description: overrides.description ?? '',
    priority: overrides.priority ?? 'normal',
    pinned: overrides.pinned ?? false,
    deadlineAt: overrides.deadlineAt ?? '2026-10-30T16:59:00.000Z',
    scheduledDate: overrides.scheduledDate === undefined ? '2026-10-30' : overrides.scheduledDate,
    status: overrides.status ?? 'active',
    completedAt: overrides.completedAt ?? null,
    reminderAt: overrides.reminderAt === undefined ? null : overrides.reminderAt,
    createdAt: overrides.createdAt ?? '2026-10-29T01:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-10-29T01:00:00.000Z',
  };
}

describe('domain/reminder (§6.5)', () => {
  const t0 = new Date('2026-10-30T00:00:00.000Z');

  it.each([
    {
      label: '3 days remaining -> deadline - 24h',
      deadlineAt: '2026-11-02T00:00:00.000Z',
      expected: '2026-11-01T00:00:00.000Z',
    },
    {
      label: 'exactly 24h remaining -> deadline - 24h (= T0)',
      deadlineAt: '2026-10-31T00:00:00.000Z',
      expected: '2026-10-30T00:00:00.000Z',
    },
    {
      label: '12h remaining -> notify when 3h left (deadline - 3h)',
      deadlineAt: '2026-10-30T12:00:00.000Z',
      expected: '2026-10-30T09:00:00.000Z',
    },
    {
      label: '1h remaining -> notify when 15m left (deadline - 15m)',
      deadlineAt: '2026-10-30T01:00:00.000Z',
      expected: '2026-10-30T00:45:00.000Z',
    },
    {
      label: '1 minute remaining -> notify when 15s left (deadline - 15s)',
      deadlineAt: '2026-10-30T00:01:00.000Z',
      expected: '2026-10-30T00:00:45.000Z',
    },
    {
      label: 'already past -> null',
      deadlineAt: '2026-10-29T23:59:00.000Z',
      expected: null,
    },
    {
      label: 'exact same instant (remaining = 0) -> null',
      deadlineAt: '2026-10-30T00:00:00.000Z',
      expected: null,
    },
  ])('$label', ({ deadlineAt, expected }) => {
    expect(computeReminderAt(deadlineAt, t0)).toBe(expected);
  });
});

describe('domain/task-status (§6.2)', () => {
  const now = new Date('2026-10-30T10:00:00.000Z');

  it('derives active normal, due-soon, overdue, and completed states accurately', () => {
    const futureNormal = makeTask({
      deadlineAt: '2026-10-31T10:00:00.000Z',
      reminderAt: '2026-10-30T12:00:00.000Z',
    });
    expect(deriveTaskState(futureNormal, now)).toEqual({
      isOverdue: false,
      isDueSoon: false,
      timeLeftMs: 24 * 60 * 60 * 1000,
    });

    const dueSoon = makeTask({
      deadlineAt: '2026-10-30T12:00:00.000Z',
      reminderAt: '2026-10-30T09:00:00.000Z',
    });
    expect(deriveTaskState(dueSoon, now)).toEqual({
      isOverdue: false,
      isDueSoon: true,
      timeLeftMs: 2 * 60 * 60 * 1000,
    });
    expect(formatTimeLeftLabel(2 * 60 * 60 * 1000 + 20 * 60 * 1000, false)).toBe('2h 20m left');

    const overdue = makeTask({
      deadlineAt: '2026-10-30T08:00:00.000Z',
      reminderAt: '2026-10-30T07:00:00.000Z',
    });
    expect(deriveTaskState(overdue, now)).toEqual({
      isOverdue: true,
      isDueSoon: false,
      timeLeftMs: -2 * 60 * 60 * 1000,
    });
    expect(formatTimeLeftLabel(-2 * 60 * 60 * 1000, true)).toBe('Overdue by 2h');

    const completedPastDeadline = makeTask({
      status: 'completed',
      completedAt: '2026-10-30T07:30:00.000Z',
      deadlineAt: '2026-10-30T08:00:00.000Z',
      reminderAt: null,
    });
    expect(deriveTaskState(completedPastDeadline, now)).toEqual({
      isOverdue: false,
      isDueSoon: false,
      timeLeftMs: -2 * 60 * 60 * 1000,
    });
  });
});

describe('domain/task-sort (§6.4)', () => {
  it('orders active before completed, pinned first, priority urgent->normal->optional, deadline asc, createdAt asc, and completedAt asc at bottom', () => {
    const completedEarlier = makeTask({
      id: '00000000-0000-4000-8000-000000000001',
      title: 'Completed earlier',
      status: 'completed',
      pinned: true,
      priority: 'urgent',
      completedAt: '2026-10-30T08:00:00.000Z',
    });
    const completedNewest = makeTask({
      id: '00000000-0000-4000-8000-000000000002',
      title: 'Completed newest (lands at very bottom)',
      status: 'completed',
      completedAt: '2026-10-30T09:30:00.000Z',
    });
    const pinnedOptional = makeTask({
      id: '00000000-0000-4000-8000-000000000003',
      title: 'Pinned optional',
      pinned: true,
      priority: 'optional',
      deadlineAt: '2026-10-30T20:00:00.000Z',
    });
    const urgentLate = makeTask({
      id: '00000000-0000-4000-8000-000000000004',
      title: 'Urgent later deadline',
      priority: 'urgent',
      deadlineAt: '2026-10-30T18:00:00.000Z',
    });
    const urgentEarly = makeTask({
      id: '00000000-0000-4000-8000-000000000005',
      title: 'Urgent earlier deadline',
      priority: 'urgent',
      deadlineAt: '2026-10-30T12:00:00.000Z',
    });
    const normalFirstCreated = makeTask({
      id: '00000000-0000-4000-8000-000000000006',
      title: 'Normal created first',
      priority: 'normal',
      deadlineAt: '2026-10-30T15:00:00.000Z',
      createdAt: '2026-10-29T01:00:00.000Z',
    });
    const normalSecondCreated = makeTask({
      id: '00000000-0000-4000-8000-000000000007',
      title: 'Normal created second',
      priority: 'normal',
      deadlineAt: '2026-10-30T15:00:00.000Z',
      createdAt: '2026-10-29T02:00:00.000Z',
    });

    const sorted = sortTasks([
      completedNewest,
      normalSecondCreated,
      urgentLate,
      completedEarlier,
      normalFirstCreated,
      urgentEarly,
      pinnedOptional,
    ]);

    expect(sorted.map((t) => t.title)).toEqual([
      'Pinned optional',
      'Urgent earlier deadline',
      'Urgent later deadline',
      'Normal created first',
      'Normal created second',
      'Completed earlier',
      'Completed newest (lands at very bottom)',
    ]);
  });
});

describe('domain/date-input (§9.2)', () => {
  // Reference: 2026-10-30 10:00 ICT
  const now = new Date('2026-10-30T03:00:00.000Z');

  it('resolves DD/MM without year to nearest occurrence on or after today, including year rollover and leap day', () => {
    expect(resolveDateInput('30/10', now, 'Asia/Saigon')?.scheduledDate).toBe('2026-10-30');
    expect(resolveDateInput('15/11', now, 'Asia/Saigon')?.scheduledDate).toBe('2026-11-15');
    // 05/01 has already passed in 2026 -> rolls over to 2027-01-05
    expect(resolveDateInput('05/01', now, 'Asia/Saigon')?.scheduledDate).toBe('2027-01-05');
    // 29/02 resolves to next leap year 2028
    expect(resolveDateInput('29/02', now, 'Asia/Saigon')?.scheduledDate).toBe('2028-02-29');
    // Invalid dates return null
    expect(resolveDateInput('31/02', now, 'Asia/Saigon')).toBeNull();
    expect(resolveDateInput('bad', now, 'Asia/Saigon')).toBeNull();
  });

  it('validates 24-hour HH:mm time and builds deadline UTC instant', () => {
    const valid = buildDeadlineFromInputs({
      dateInput: '30/10',
      timeInput: '23:59',
      referenceNow: now,
      timeZone: 'Asia/Saigon',
    });
    expect(valid).toEqual({
      ok: true,
      scheduledDate: '2026-10-30',
      deadlineAt: '2026-10-30T16:59:00.000Z',
    });

    const invalidTime = buildDeadlineFromInputs({
      dateInput: '30/10',
      timeInput: '25:00',
      referenceNow: now,
      timeZone: 'Asia/Saigon',
    });
    expect(invalidTime.ok).toBe(false);
  });

  it('computes Monday-to-Sunday week dates and Monday-aligned month calendar grids', () => {
    const week = getWeekDates('2026-10-30', 'Asia/Saigon');
    expect(week).toHaveLength(7);
    expect(week[0]).toBe('2026-10-26'); // Monday
    expect(week[6]).toBe('2026-11-01'); // Sunday

    const month = getMonthCalendarCells('2026-10-30', 'Asia/Saigon');
    expect(month.monthLabel).toBe('October 2026');
    expect(month.cells.length % 7).toBe(0);
    expect(month.cells.some((c) => c.scheduledDate === '2026-10-30' && c.inCurrentMonth)).toBe(
      true,
    );
  });
});
