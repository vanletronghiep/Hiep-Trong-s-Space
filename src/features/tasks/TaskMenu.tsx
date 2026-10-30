'use client';

import { useRef, useState, type MouseEvent } from 'react';
import {
  ArrowRightLeft,
  CalendarMinus,
  CalendarPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { TaskDto } from '@/contracts';
import { DEFAULT_APP_TIMEZONE, formatScheduledDate, shiftScheduledDate } from '@/domain/time';
import { Popover } from '@/ui/Popover';
import { cn } from '@/ui/cn';

export interface TaskMenuProps {
  task: TaskDto;
  isOverdue: boolean;
  now: Date;
  timeZone?: string;
  context?: 'daily' | 'overdue' | 'hub';
  onEdit: (task: TaskDto) => void;
  onScheduleDate: (task: TaskDto, scheduledDate: string | null) => void;
  onOpenPickDate: (task: TaskDto) => void;
  onOpenTransfer: (task: TaskDto) => void;
  onRequestDelete: (task: TaskDto) => void;
}

export function TaskMenu({
  task,
  isOverdue,
  now,
  timeZone = DEFAULT_APP_TIMEZONE,
  context = 'daily',
  onEdit,
  onScheduleDate,
  onOpenPickDate,
  onOpenTransfer,
  onRequestDelete,
}: TaskMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const todayStr = formatScheduledDate(now, timeZone);
  const tomorrowStr = shiftScheduledDate(todayStr, 1, timeZone);

  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const runAction = (fn: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen(false);
    fn();
  };

  const showAddScheduleOptions = context === 'hub' || task.scheduledDate === null;

  return (
    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${task.title}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleTriggerClick}
        className="inline-flex items-center justify-center h-9 w-9 -mr-1.5 -mt-1 rounded-pill text-ws-text-muted hover:text-ws-text hover:bg-ws-accent-soft transition-colors duration-[var(--dur-fast)] cursor-pointer"
      >
        <MoreHorizontal size={18} strokeWidth={1.5} />
      </button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={triggerRef}
        aria-label={`Menu for ${task.title}`}
        width={220}
        className="p-1.5"
      >
        <div className="flex flex-col gap-0.5">
          <MenuActionButton
            icon={<Pencil size={15} strokeWidth={1.5} />}
            label="Edit"
            onClick={runAction(() => onEdit(task))}
          />

          {isOverdue ? (
            <MenuActionButton
              icon={<ArrowRightLeft size={15} strokeWidth={1.5} />}
              label="Transfer…"
              onClick={runAction(() => onOpenTransfer(task))}
            />
          ) : null}

          {showAddScheduleOptions ? (
            <>
              {task.scheduledDate !== todayStr ? (
                <MenuActionButton
                  icon={<CalendarPlus size={15} strokeWidth={1.5} />}
                  label="Add to today"
                  onClick={runAction(() => onScheduleDate(task, todayStr))}
                />
              ) : null}
              {task.scheduledDate !== tomorrowStr ? (
                <MenuActionButton
                  icon={<CalendarPlus size={15} strokeWidth={1.5} />}
                  label="Add to tomorrow"
                  onClick={runAction(() => onScheduleDate(task, tomorrowStr))}
                />
              ) : null}
              <MenuActionButton
                icon={<CalendarPlus size={15} strokeWidth={1.5} />}
                label="Pick date…"
                onClick={runAction(() => onOpenPickDate(task))}
              />
            </>
          ) : null}

          {task.scheduledDate !== null ? (
            <MenuActionButton
              icon={<CalendarMinus size={15} strokeWidth={1.5} />}
              label={task.scheduledDate === todayStr ? 'Remove from today' : 'Remove from daily'}
              onClick={runAction(() => onScheduleDate(task, null))}
            />
          ) : null}

          <div className="my-1 border-t border-ws-border" />

          <MenuActionButton
            icon={<Trash2 size={15} strokeWidth={1.5} />}
            label="Delete"
            destructive
            onClick={runAction(() => onRequestDelete(task))}
          />
        </div>
      </Popover>
    </div>
  );
}

function MenuActionButton({
  icon,
  label,
  destructive = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  destructive?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full h-10 px-3 rounded-sm text-[length:var(--fs-ui)] font-normal text-left cursor-pointer transition-colors duration-[var(--dur-fast)]',
        destructive
          ? 'text-text-overdue hover:bg-tint-overdue-bg'
          : 'text-ws-text hover:bg-ws-accent-soft',
      )}
    >
      <span className="inline-flex shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
