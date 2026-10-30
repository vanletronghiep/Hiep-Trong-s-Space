'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { TaskDto } from '@/contracts';
import { formatDayColumnHeader, getMonthCalendarCells } from '@/domain/date-input';
import { sortTasks } from '@/domain/task-sort';
import { deriveTaskState } from '@/domain/task-status';
import { DEFAULT_APP_TIMEZONE, formatScheduledDate } from '@/domain/time';
import { Drawer } from '@/ui/Drawer';
import { EmptyState } from '@/ui/EmptyState';
import { cn } from '@/ui/cn';
import { FinishedCounter } from './FinishedCounter';
import { TaskCard } from './TaskCard';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export interface MonthViewProps {
  anchorDate: string;
  tasks: readonly TaskDto[];
  now: Date;
  timeZone?: string;
  recentlyCreatedId: string | null;
  onToggleComplete: (task: TaskDto) => void;
  onEdit: (task: TaskDto) => void;
  onScheduleDate: (task: TaskDto, scheduledDate: string | null) => void;
  onOpenPickDate: (task: TaskDto) => void;
  onOpenTransfer: (task: TaskDto) => void;
  onRequestDelete: (task: TaskDto) => void;
}

export function MonthView({
  anchorDate,
  tasks,
  now,
  timeZone = DEFAULT_APP_TIMEZONE,
  recentlyCreatedId,
  onToggleComplete,
  onEdit,
  onScheduleDate,
  onOpenPickDate,
  onOpenTransfer,
  onRequestDelete,
}: MonthViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const todayStr = formatScheduledDate(now, timeZone);

  const { cells } = useMemo(
    () => getMonthCalendarCells(anchorDate, timeZone),
    [anchorDate, timeZone],
  );

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    for (const task of tasks) {
      if (!task.scheduledDate) continue;
      const bucket = map.get(task.scheduledDate) ?? [];
      bucket.push(task);
      map.set(task.scheduledDate, bucket);
    }
    return map;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDate) return [];
    return sortTasks(tasksByDate.get(selectedDate) ?? []);
  }, [selectedDate, tasksByDate]);

  const selectedHeader = selectedDate ? formatDayColumnHeader(selectedDate, timeZone) : null;

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
        {WEEKDAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-[length:var(--fs-micro)] font-medium text-ws-text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((cell) => {
          const dayTasks = tasksByDate.get(cell.scheduledDate) ?? [];
          const activeCount = dayTasks.filter((t) => t.status === 'active').length;
          const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
          const hasOverdue = dayTasks.some((t) => deriveTaskState(t, now).isOverdue);
          const isToday = cell.scheduledDate === todayStr;

          return (
            <button
              key={cell.scheduledDate}
              type="button"
              onClick={() => setSelectedDate(cell.scheduledDate)}
              aria-label={`${cell.scheduledDate}: ${activeCount} active, ${completedCount} completed`}
              className={cn(
                'flex flex-col justify-between min-h-[72px] sm:min-h-[92px] p-2 sm:p-3 rounded-item border text-left cursor-pointer',
                'transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)]',
                cell.inCurrentMonth
                  ? 'bg-ws-surface text-ws-text hover:border-[color-mix(in_srgb,var(--ws-accent)_50%,var(--ws-border))]'
                  : 'bg-[color-mix(in_srgb,var(--ws-surface)_45%,var(--ws-bg))] text-ws-text-muted',
                isToday ? 'border-ws-accent ring-1 ring-ws-accent' : 'border-ws-border',
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    'text-[length:var(--fs-small)] tabular-nums',
                    isToday ? 'font-semibold text-ws-text' : 'font-normal',
                  )}
                >
                  {cell.dayNumber}
                </span>
                {hasOverdue ? (
                  <span
                    aria-hidden="true"
                    title="Contains overdue tasks"
                    className="h-2 w-2 rounded-pill bg-status-overdue"
                  />
                ) : null}
              </div>

              {dayTasks.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {activeCount > 0 ? (
                    <span className="inline-flex items-center px-1.5 h-5 rounded-pill bg-ws-accent-soft text-ws-text text-[length:var(--fs-micro)] font-medium tabular-nums">
                      {activeCount}
                    </span>
                  ) : null}
                  {completedCount > 0 ? (
                    <span className="hidden sm:inline-flex items-center px-1.5 h-5 rounded-pill border border-ws-border text-ws-text-muted text-[length:var(--fs-micro)] tabular-nums">
                      {completedCount} done
                    </span>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <Drawer
        open={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={
          selectedHeader ? `${selectedHeader.weekday}, ${selectedHeader.dayMonth}` : 'Day tasks'
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[length:var(--fs-small)] text-ws-text-muted">
              Manage tasks scheduled for this date
            </span>
            <FinishedCounter
              count={selectedDayTasks.filter((t) => t.status === 'completed').length}
            />
          </div>

          {selectedDayTasks.length === 0 ? (
            <EmptyState compact title="No tasks scheduled for this day." />
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {selectedDayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    now={now}
                    timeZone={timeZone}
                    context="daily"
                    isNew={recentlyCreatedId === task.id}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onScheduleDate={onScheduleDate}
                    onOpenPickDate={onOpenPickDate}
                    onOpenTransfer={onOpenTransfer}
                    onRequestDelete={onRequestDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
