'use client';

import { AnimatePresence } from 'motion/react';
import type { TaskDto } from '@/contracts';
import { formatDayColumnHeader, getWeekDates } from '@/domain/date-input';
import { sortTasks } from '@/domain/task-sort';
import { DEFAULT_APP_TIMEZONE, formatScheduledDate } from '@/domain/time';
import { cn } from '@/ui/cn';
import { FinishedCounter } from './FinishedCounter';
import { TaskCard } from './TaskCard';

export interface WeekViewProps {
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

export function WeekView({
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
}: WeekViewProps) {
  const weekDates = getWeekDates(anchorDate, timeZone);
  const todayStr = formatScheduledDate(now, timeZone);

  return (
    <div className="w-full overflow-x-auto pb-3">
      <div className="grid grid-cols-7 gap-3 min-w-[1120px]">
        {weekDates.map((dateStr) => {
          const isToday = dateStr === todayStr;
          const header = formatDayColumnHeader(dateStr, timeZone);
          const dayTasks = sortTasks(tasks.filter((t) => t.scheduledDate === dateStr));
          const completedCount = dayTasks.filter((t) => t.status === 'completed').length;

          return (
            <section
              key={dateStr}
              aria-label={`${header.weekday} ${header.dayMonth}`}
              className={cn(
                'flex flex-col rounded-card p-2.5 min-h-[260px]',
                isToday && 'bg-[color-mix(in_srgb,var(--ws-accent)_6%,transparent)]',
              )}
            >
              <header
                className={cn(
                  'flex items-center justify-between pb-2.5 mb-3 border-b',
                  isToday ? 'border-ws-accent' : 'border-ws-border',
                )}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[length:var(--fs-ui)] font-semibold text-ws-text">
                    {header.shortWeekday}
                  </span>
                  <span className="text-[length:var(--fs-small)] text-ws-text-muted tabular-nums">
                    {header.dayMonth}
                  </span>
                </div>
                <FinishedCounter count={completedCount} />
              </header>

              {dayTasks.length === 0 ? (
                <p className="py-8 text-center text-[length:var(--fs-small)] text-ws-text-muted">
                  No tasks.
                </p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <AnimatePresence initial={false}>
                    {dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        now={now}
                        timeZone={timeZone}
                        context="daily"
                        dense
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
