'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, Clock, Pin, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { TaskDto } from '@/contracts';
import { MOTION_DURATION, MOTION_EASE } from '@/design/motion';
import { formatDayColumnHeader } from '@/domain/date-input';
import { deriveTaskState, formatTimeLeftLabel } from '@/domain/task-status';
import {
  DEFAULT_APP_TIMEZONE,
  formatDisplayDateTime,
  formatScheduledDate,
  shiftScheduledDate,
} from '@/domain/time';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Checkbox } from '@/ui/Checkbox';
import { Chip } from '@/ui/Chip';
import { cn } from '@/ui/cn';
import { DueSoonDot } from './DueSoonDot';
import { PriorityBadge } from './PriorityBadge';
import { TaskMenu } from './TaskMenu';

export interface TaskCardProps {
  task: TaskDto;
  now: Date;
  timeZone?: string;
  context?: 'daily' | 'overdue' | 'hub';
  dense?: boolean;
  isNew?: boolean;
  isHighlighted?: boolean;
  onToggleComplete: (task: TaskDto) => void;
  onEdit: (task: TaskDto) => void;
  onScheduleDate: (task: TaskDto, scheduledDate: string | null) => void;
  onOpenPickDate: (task: TaskDto) => void;
  onOpenTransfer: (task: TaskDto) => void;
  onRequestDelete: (task: TaskDto) => void;
}

export function TaskCard({
  task,
  now,
  timeZone = DEFAULT_APP_TIMEZONE,
  context = 'daily',
  dense = false,
  isNew = false,
  isHighlighted = false,
  onToggleComplete,
  onEdit,
  onScheduleDate,
  onOpenPickDate,
  onOpenTransfer,
  onRequestDelete,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(isHighlighted);
  const cardRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const derived = deriveTaskState(task, now);
  const isCompleted = task.status === 'completed';
  const hasDescription = task.description.trim().length > 0;

  useEffect(() => {
    if (isHighlighted) {
      setExpanded(true);
    }
  }, [isHighlighted]);

  useEffect(() => {
    if ((isNew || isHighlighted) && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }
  }, [isNew, isHighlighted, reducedMotion]);

  const todayStr = formatScheduledDate(now, timeZone);
  const tomorrowStr = shiftScheduledDate(todayStr, 1, timeZone);
  const deadlineDisplay = formatDisplayDateTime(task.deadlineAt, now, timeZone);
  const scheduledHeader = task.scheduledDate
    ? formatDayColumnHeader(task.scheduledDate, timeZone)
    : null;

  return (
    <motion.article
      ref={cardRef}
      id={`task-card-${task.id}`}
      layout={reducedMotion ? false : 'position'}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: isCompleted ? 0.72 : 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{
        duration: reducedMotion ? 0 : MOTION_DURATION.layout,
        ease: MOTION_EASE,
      }}
      onClick={() => setExpanded((prev) => !prev)}
      className={cn(
        'group/card relative flex flex-col rounded-task border cursor-pointer select-none',
        dense ? 'p-3.5 gap-2' : 'px-[18px] py-4 gap-2.5',
        'transition-[border-color,box-shadow,transform,background-color] duration-200 ease-[var(--ease)]',
        derived.isOverdue
          ? 'bg-tint-overdue-bg border-tint-overdue-border'
          : task.pinned && !isCompleted
            ? 'bg-ws-surface border-ws-accent-soft'
            : task.priority === 'urgent' && !isCompleted
              ? 'bg-ws-surface border-[color-mix(in_srgb,var(--status-overdue)_20%,var(--ws-border))]'
              : 'bg-ws-surface border-ws-border',
        isCompleted
          ? 'shadow-none'
          : 'shadow-task hover:shadow-task-hover hover:-translate-y-0.5 active:translate-y-0 hover:border-[color-mix(in_srgb,var(--ws-accent)_45%,var(--ws-border))] motion-reduce:hover:translate-y-0',
        isNew && 'animate-task-new-glow',
        isHighlighted && 'animate-task-highlight-glow',
      )}
    >
      {/* Top row: Checkbox + Title + Three-dot menu */}
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(task)}
            aria-label={isCompleted ? `Mark ${task.title} as active` : `Complete ${task.title}`}
          />
        </div>

        <h3
          className={cn(
            'flex-1 text-[length:var(--fs-body)] font-semibold leading-snug break-words',
            !expanded && 'line-clamp-2',
            isCompleted
              ? 'italic line-through decoration-text-completed decoration-1 text-text-completed font-normal'
              : 'text-ws-text',
          )}
        >
          {task.title}
        </h3>

        <TaskMenu
          task={task}
          isOverdue={derived.isOverdue}
          now={now}
          timeZone={timeZone}
          context={context}
          onEdit={onEdit}
          onScheduleDate={onScheduleDate}
          onOpenPickDate={onOpenPickDate}
          onOpenTransfer={onOpenTransfer}
          onRequestDelete={onRequestDelete}
        />
      </div>

      {/* Middle row: Description (omitted completely when empty so zero extra gap appears) */}
      {hasDescription ? (
        <p
          className={cn(
            'pl-8 text-[length:var(--fs-ui)] leading-[1.55] whitespace-pre-line break-words',
            isCompleted ? 'text-text-completed' : 'text-ws-text-muted',
            !expanded && (dense ? 'line-clamp-1' : 'line-clamp-2'),
          )}
        >
          {task.description}
        </p>
      ) : null}

      {/* Bottom metadata row */}
      <div className="pl-8 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[length:var(--fs-small)]">
        <PriorityBadge priority={task.priority} />

        {task.pinned ? (
          <span
            aria-label="Pinned to top of day"
            title="Pinned"
            className="inline-flex items-center text-text-accent"
          >
            <Pin size={14} strokeWidth={1.5} />
          </span>
        ) : null}

        {context === 'hub' && scheduledHeader ? (
          <Badge tone="general">Scheduled {scheduledHeader.dayMonth}</Badge>
        ) : null}

        <span className="tabular-nums text-ws-text-muted">{deadlineDisplay}</span>

        {!isCompleted ? (
          derived.isOverdue ? (
            <span className="inline-flex items-center gap-1 font-medium text-text-overdue tabular-nums">
              <Clock size={13} strokeWidth={1.5} className="shrink-0" />
              <span>{formatTimeLeftLabel(derived.timeLeftMs, true)}</span>
            </span>
          ) : (
            <span className="text-ws-text-muted tabular-nums">
              · {formatTimeLeftLabel(derived.timeLeftMs, false)}
            </span>
          )
        ) : null}

        {derived.isDueSoon ? <DueSoonDot /> : null}
      </div>

      {/* Expanded schedule action row in Tasks Hub (§9.1 & §9.4) */}
      {context === 'hub' && expanded ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pl-8 pt-2 mt-0.5 border-t border-ws-border flex flex-wrap items-center gap-1.5"
        >
          <Chip
            active={task.scheduledDate === todayStr}
            onClick={() => onScheduleDate(task, todayStr)}
          >
            Add to today
          </Chip>
          <Chip
            active={task.scheduledDate === tomorrowStr}
            onClick={() => onScheduleDate(task, tomorrowStr)}
          >
            Add to tomorrow
          </Chip>
          <Chip onClick={() => onOpenPickDate(task)}>Pick date…</Chip>
          {task.scheduledDate !== null ? (
            <Chip onClick={() => onScheduleDate(task, null)}>Remove from daily</Chip>
          ) : null}
        </div>
      ) : null}

      {/* Direct Transfer & Delete actions in Overdue lane (§9.3 & ui_readme.md §14.5) */}
      {context === 'overdue' ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="pl-8 pt-2 mt-0.5 border-t border-tint-overdue-border flex flex-wrap items-center justify-end gap-2"
        >
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<ArrowRightLeft size={14} strokeWidth={1.5} />}
            onClick={() => onOpenTransfer(task)}
          >
            Transfer
          </Button>
          <Button
            size="sm"
            variant="destructive"
            leftIcon={<Trash2 size={14} strokeWidth={1.5} />}
            onClick={() => onRequestDelete(task)}
          >
            Delete
          </Button>
        </div>
      ) : null}
    </motion.article>
  );
}
