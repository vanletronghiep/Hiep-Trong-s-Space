'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import type { TaskDto } from '@/contracts';
import { buildDeadlineFromInputs, isFutureInstant, resolveDateInput } from '@/domain/date-input';
import { DEFAULT_APP_TIMEZONE, formatScheduledDate, shiftScheduledDate } from '@/domain/time';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { Dialog } from '@/ui/Dialog';

export interface TransferDialogProps {
  task: TaskDto | null;
  open: boolean;
  onClose: () => void;
  onSubmitTransfer: (
    taskId: string,
    payload: { scheduledDate: string; deadlineAt: string },
  ) => Promise<void>;
  now: Date;
  timeZone?: string;
  isSubmitting?: boolean;
}

export function TransferDialog({
  task,
  open,
  onClose,
  onSubmitTransfer,
  now,
  timeZone = DEFAULT_APP_TIMEZONE,
  isSubmitting = false,
}: TransferDialogProps) {
  const todayStr = formatScheduledDate(now, timeZone);
  const tomorrowStr = shiftScheduledDate(todayStr, 1, timeZone);

  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('23:59');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dateFieldRef = useRef<HTMLInputElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const defaultDate = isFutureInstant(
        buildDeadlineFromInputs({
          dateInput: todayStr,
          timeInput: '23:59',
          referenceNow: now,
          timeZone,
        }).ok
          ? (
              buildDeadlineFromInputs({
                dateInput: todayStr,
                timeInput: '23:59',
                referenceNow: now,
                timeZone,
              }) as { ok: true; deadlineAt: string }
            ).deadlineAt
          : now.toISOString(),
        now,
      )
        ? todayStr
        : tomorrowStr;

      const resolved = resolveDateInput(defaultDate, now, timeZone);
      setDateInput(resolved?.displayInput ?? '');
      setTimeInput('23:59');
      setErrorMessage(null);
    }
  }, [open, now, timeZone, todayStr, tomorrowStr]);

  const resolvedDate = resolveDateInput(dateInput, now, timeZone);

  const applyPresetDate = (isoDate: string) => {
    const resolved = resolveDateInput(isoDate, now, timeZone);
    if (resolved) {
      setDateInput(resolved.displayInput);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!task) {
      return;
    }

    const built = buildDeadlineFromInputs({
      dateInput,
      timeInput,
      referenceNow: now,
      timeZone,
    });

    if (!built.ok) {
      setErrorMessage(built.message);
      return;
    }

    if (!isFutureInstant(built.deadlineAt, new Date())) {
      setErrorMessage('New deadline must be in the future.');
      return;
    }

    setErrorMessage(null);
    try {
      await onSubmitTransfer(task.id, {
        scheduledDate: built.scheduledDate,
        deadlineAt: built.deadlineAt,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to transfer task.');
    }
  };

  return (
    <Dialog
      open={open && task !== null}
      onClose={onClose}
      title="Transfer overdue task"
      description={task ? `Choose a new date and deadline time for “${task.title}”.` : undefined}
      initialFocusRef={dateFieldRef}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <Chip
            active={resolvedDate?.scheduledDate === todayStr}
            onClick={() => applyPresetDate(todayStr)}
          >
            Today
          </Chip>
          <Chip
            active={resolvedDate?.scheduledDate === tomorrowStr}
            onClick={() => applyPresetDate(tomorrowStr)}
          >
            Tomorrow
          </Chip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="transfer-date-input"
              className="block text-[length:var(--fs-ui)] font-medium text-ws-text mb-1.5"
            >
              New date (DD/MM)
            </label>
            <div className="relative flex items-center">
              <input
                ref={dateFieldRef}
                id="transfer-date-input"
                type="text"
                placeholder="31/10"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full h-11 rounded-item bg-ws-surface border border-ws-border px-3.5 pr-10 text-[length:var(--fs-ui)] text-ws-text tabular-nums"
              />
              <button
                type="button"
                aria-label="Open calendar picker"
                onClick={() => nativeDateRef.current?.showPicker?.()}
                className="absolute right-2 inline-flex items-center justify-center h-8 w-8 rounded-sm text-ws-text-muted hover:text-ws-text hover:bg-ws-accent-soft cursor-pointer"
              >
                <Calendar size={16} strokeWidth={1.5} />
              </button>
              <input
                ref={nativeDateRef}
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                value={resolvedDate?.scheduledDate ?? ''}
                onChange={(e) => {
                  if (e.target.value) {
                    applyPresetDate(e.target.value);
                  }
                }}
                className="sr-only"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="transfer-time-input"
              className="block text-[length:var(--fs-ui)] font-medium text-ws-text mb-1.5"
            >
              New time (24h)
            </label>
            <input
              id="transfer-time-input"
              type="text"
              placeholder="23:59"
              value={timeInput}
              onChange={(e) => {
                setTimeInput(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full h-11 rounded-item bg-ws-surface border border-ws-border px-3.5 text-[length:var(--fs-ui)] text-ws-text tabular-nums"
            />
          </div>
        </div>

        {resolvedDate ? (
          <p className="text-[length:var(--fs-small)] text-ws-text-muted">
            Resolves to {resolvedDate.humanLabel}
          </p>
        ) : null}

        {errorMessage ? (
          <div
            role="alert"
            className="flex items-center gap-2 text-[length:var(--fs-small)] text-text-overdue"
          >
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Transfer
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export interface ScheduleDateDialogProps {
  task: TaskDto | null;
  open: boolean;
  onClose: () => void;
  onSelectDate: (taskId: string, scheduledDate: string) => Promise<void>;
  now: Date;
  timeZone?: string;
  isSubmitting?: boolean;
}

export function ScheduleDateDialog({
  task,
  open,
  onClose,
  onSelectDate,
  now,
  timeZone = DEFAULT_APP_TIMEZONE,
  isSubmitting = false,
}: ScheduleDateDialogProps) {
  const todayStr = formatScheduledDate(now, timeZone);
  const tomorrowStr = shiftScheduledDate(todayStr, 1, timeZone);

  const [dateInput, setDateInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const initialIso = task?.scheduledDate ?? todayStr;
      const resolved = resolveDateInput(initialIso, now, timeZone);
      setDateInput(resolved?.displayInput ?? '');
      setErrorMessage(null);
    }
  }, [open, task, todayStr, now, timeZone]);

  const resolvedDate = resolveDateInput(dateInput, now, timeZone);

  const applyPreset = (isoDate: string) => {
    const resolved = resolveDateInput(isoDate, now, timeZone);
    if (resolved) {
      setDateInput(resolved.displayInput);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!task) {
      return;
    }
    if (!resolvedDate) {
      setErrorMessage('Enter a valid date as DD/MM.');
      return;
    }
    try {
      await onSelectDate(task.id, resolvedDate.scheduledDate);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to schedule task.');
    }
  };

  return (
    <Dialog
      open={open && task !== null}
      onClose={onClose}
      title="Schedule for a day"
      description={
        task ? `Place “${task.title}” on a Daily column without changing its deadline.` : undefined
      }
      initialFocusRef={inputRef}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <Chip
            active={resolvedDate?.scheduledDate === todayStr}
            onClick={() => applyPreset(todayStr)}
          >
            Today
          </Chip>
          <Chip
            active={resolvedDate?.scheduledDate === tomorrowStr}
            onClick={() => applyPreset(tomorrowStr)}
          >
            Tomorrow
          </Chip>
        </div>

        <div>
          <label
            htmlFor="schedule-date-input"
            className="block text-[length:var(--fs-ui)] font-medium text-ws-text mb-1.5"
          >
            Day (DD/MM)
          </label>
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              id="schedule-date-input"
              type="text"
              placeholder="30/10"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full h-11 rounded-item bg-ws-surface border border-ws-border px-3.5 pr-10 text-[length:var(--fs-ui)] text-ws-text tabular-nums"
            />
            <button
              type="button"
              aria-label="Open calendar picker"
              onClick={() => nativeDateRef.current?.showPicker?.()}
              className="absolute right-2 inline-flex items-center justify-center h-8 w-8 rounded-sm text-ws-text-muted hover:text-ws-text hover:bg-ws-accent-soft cursor-pointer"
            >
              <Calendar size={16} strokeWidth={1.5} />
            </button>
            <input
              ref={nativeDateRef}
              type="date"
              tabIndex={-1}
              aria-hidden="true"
              value={resolvedDate?.scheduledDate ?? ''}
              onChange={(e) => {
                if (e.target.value) {
                  applyPreset(e.target.value);
                }
              }}
              className="sr-only"
            />
          </div>
        </div>

        {resolvedDate ? (
          <p className="text-[length:var(--fs-small)] text-ws-text-muted">
            Resolves to {resolvedDate.humanLabel}
          </p>
        ) : null}

        {errorMessage ? (
          <div
            role="alert"
            className="flex items-center gap-2 text-[length:var(--fs-small)] text-text-overdue"
          >
            <AlertCircle size={15} strokeWidth={1.5} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
