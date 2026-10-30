'use client';

import { useMemo } from 'react';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { AnimatePresence } from 'motion/react';
import type { TaskDto } from '@/contracts';
import { deriveTaskState } from '@/domain/task-status';
import { DEFAULT_APP_TIMEZONE } from '@/domain/time';
import { Badge } from '@/ui/Badge';
import { EmptyState } from '@/ui/EmptyState';
import { TaskCard } from './TaskCard';

export interface OverdueListProps {
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

export function OverdueList({
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
}: OverdueListProps) {
  // §6.3: Overdue list = all active tasks with isOverdue, any date, sorted by deadline ascending (oldest first).
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((task) => deriveTaskState(task, now).isOverdue)
      .sort((a, b) => differenceInMilliseconds(parseISO(a.deadlineAt), parseISO(b.deadlineAt)));
  }, [tasks, now]);

  return (
    <section
      aria-labelledby="overdue-section-heading"
      className="pt-8 mt-4 border-t border-ws-border"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <h2
          id="overdue-section-heading"
          className="font-display text-[length:var(--fs-h2)] leading-[var(--lh-heading)] font-medium text-ws-text"
        >
          Overdue
        </h2>
        <Badge tone={overdueTasks.length > 0 ? 'overdue' : 'count'} className="tabular-nums">
          {overdueTasks.length}
        </Badge>
      </div>

      {overdueTasks.length === 0 ? (
        <EmptyState compact title="Nothing overdue." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {overdueTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                now={now}
                timeZone={timeZone}
                context="overdue"
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
}
