'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { ClientApiError } from '@/client/api-client';
import type { CreateTaskInput, Priority, TaskDto, UpdateTaskInput } from '@/contracts';
import {
  buildDeadlineFromInputs,
  extractZonedDateAndTime,
  isFutureInstant,
  resolveDateInput,
} from '@/domain/date-input';
import { DEFAULT_APP_TIMEZONE, formatScheduledDate, shiftScheduledDate } from '@/domain/time';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { Drawer } from '@/ui/Drawer';
import { SegmentedControl, type SegmentedOption } from '@/ui/SegmentedControl';
import { cn } from '@/ui/cn';

const PRIORITY_OPTIONS: readonly SegmentedOption<Priority>[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'normal', label: 'Normal' },
  { value: 'optional', label: 'Optional' },
];

export interface TaskFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialTask?: TaskDto | null;
  defaultScheduledDate?: string | null;
  now: Date;
  timeZone?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onCreate: (input: CreateTaskInput) => Promise<TaskDto>;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<TaskDto>;
}

interface FieldErrors {
  title?: string;
  deadlineDate?: string;
  deadlineTime?: string;
  description?: string;
  form?: string;
}

export function TaskForm({
  open,
  mode,
  initialTask,
  defaultScheduledDate = null,
  now,
  timeZone = DEFAULT_APP_TIMEZONE,
  isSubmitting = false,
  onClose,
  onCreate,
  onUpdate,
}: TaskFormProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const nativeDateRef = useRef<HTMLInputElement>(null);

  const todayStr = formatScheduledDate(now, timeZone);
  const tomorrowStr = shiftScheduledDate(todayStr, 1, timeZone);

  const [title, setTitle] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('normal');
  const [description, setDescription] = useState('');
  const [pinned, setPinned] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setErrors({});

    if (mode === 'edit' && initialTask) {
      const extracted = extractZonedDateAndTime(initialTask.deadlineAt, now, timeZone);
      setTitle(initialTask.title);
      setDateInput(extracted.dateInput);
      setTimeInput(extracted.timeHm);
      setPriority(initialTask.priority);
      setDescription(initialTask.description);
      setPinned(initialTask.pinned);
      return;
    }

    const baseDate = defaultScheduledDate ?? todayStr;
    const resolved = resolveDateInput(baseDate, now, timeZone);
    setTitle('');
    setDateInput(resolved?.displayInput ?? '');
    setTimeInput('23:59');
    setPriority('normal');
    setDescription('');
    setPinned(false);
  }, [open, mode, initialTask, defaultScheduledDate, todayStr, now, timeZone]);

  const resolvedDate = resolveDateInput(dateInput, now, timeZone);

  const applyPresetDate = (isoDate: string) => {
    const resolved = resolveDateInput(isoDate, now, timeZone);
    if (resolved) {
      setDateInput(resolved.displayInput);
      setErrors((prev) => ({ ...prev, deadlineDate: undefined, form: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Enter a task title.';
    } else if (trimmedTitle.length > 120) {
      nextErrors.title = 'Title must be 120 characters or fewer.';
    }

    if (description.length > 2000) {
      nextErrors.description = 'Description must be 2000 characters or fewer.';
    }

    const builtDeadline = buildDeadlineFromInputs({
      dateInput,
      timeInput,
      referenceNow: now,
      timeZone,
    });

    if (!builtDeadline.ok) {
      if (builtDeadline.field === 'date') {
        nextErrors.deadlineDate = builtDeadline.message;
      } else {
        nextErrors.deadlineTime = builtDeadline.message;
      }
    } else if (mode === 'create' && !isFutureInstant(builtDeadline.deadlineAt, new Date())) {
      nextErrors.deadlineDate = 'New tasks must have a deadline in the future.';
    }

    if (Object.keys(nextErrors).length > 0 || !builtDeadline.ok) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      if (mode === 'edit' && initialTask) {
        await onUpdate(initialTask.id, {
          title: trimmedTitle,
          description,
          priority,
          pinned,
          deadlineAt: builtDeadline.deadlineAt,
        });
      } else {
        await onCreate({
          title: trimmedTitle,
          description,
          priority,
          pinned,
          deadlineAt: builtDeadline.deadlineAt,
          scheduledDate: defaultScheduledDate,
        });
      }
      onClose();
    } catch (error: unknown) {
      if (error instanceof ClientApiError && error.fields) {
        setErrors({
          title: error.fields.title,
          deadlineDate: error.fields.deadlineAt,
          description: error.fields.description,
          form: error.message,
        });
        return;
      }
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to save task.',
      });
    }
  };

  const formId = 'hts-task-editor-form';

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit task' : 'New task'}
      initialFocusRef={titleInputRef}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="primary" disabled={isSubmitting}>
            Save
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="task-title-input"
              className="text-[length:var(--fs-ui)] font-medium text-ws-text"
            >
              Title
            </label>
            {title.length >= 100 ? (
              <span
                className={cn(
                  'text-[length:var(--fs-micro)] tabular-nums',
                  title.length > 120 ? 'text-text-overdue font-medium' : 'text-ws-text-muted',
                )}
              >
                {title.length}/120
              </span>
            ) : null}
          </div>
          <input
            ref={titleInputRef}
            id="task-title-input"
            type="text"
            placeholder="What needs your attention?"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            aria-invalid={Boolean(errors.title)}
            className={cn(
              'w-full h-11 rounded-item bg-ws-surface border px-3.5 text-[length:var(--fs-ui)] text-ws-text placeholder:text-ws-text-muted',
              errors.title ? 'border-tint-overdue-border' : 'border-ws-border',
            )}
          />
          {errors.title ? <InlineFieldError message={errors.title} /> : null}
        </div>

        {/* Deadline Date & Time */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[length:var(--fs-ui)] font-medium text-ws-text">Deadline</span>
            <div className="flex items-center gap-1.5">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-date-input" className="sr-only">
                Deadline date (DD/MM)
              </label>
              <div className="relative flex items-center">
                <input
                  id="task-date-input"
                  type="text"
                  placeholder="30/10"
                  value={dateInput}
                  onChange={(e) => {
                    setDateInput(e.target.value);
                    if (errors.deadlineDate) {
                      setErrors((prev) => ({ ...prev, deadlineDate: undefined }));
                    }
                  }}
                  aria-invalid={Boolean(errors.deadlineDate)}
                  className={cn(
                    'w-full h-11 rounded-item bg-ws-surface border px-3.5 pr-10 text-[length:var(--fs-ui)] text-ws-text placeholder:text-ws-text-muted tabular-nums',
                    errors.deadlineDate ? 'border-tint-overdue-border' : 'border-ws-border',
                  )}
                />
                <button
                  type="button"
                  aria-label="Pick date from calendar"
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
              <label htmlFor="task-time-input" className="sr-only">
                Deadline time (HH:mm)
              </label>
              <input
                id="task-time-input"
                type="text"
                placeholder="23:59"
                value={timeInput}
                onChange={(e) => {
                  setTimeInput(e.target.value);
                  if (errors.deadlineTime) {
                    setErrors((prev) => ({ ...prev, deadlineTime: undefined }));
                  }
                }}
                aria-invalid={Boolean(errors.deadlineTime)}
                className={cn(
                  'w-full h-11 rounded-item bg-ws-surface border px-3.5 text-[length:var(--fs-ui)] text-ws-text placeholder:text-ws-text-muted tabular-nums',
                  errors.deadlineTime ? 'border-tint-overdue-border' : 'border-ws-border',
                )}
              />
            </div>
          </div>

          {resolvedDate ? (
            <p className="text-[length:var(--fs-small)] text-ws-text-muted">
              Resolves to {resolvedDate.humanLabel}
            </p>
          ) : null}

          {errors.deadlineDate ? <InlineFieldError message={errors.deadlineDate} /> : null}
          {errors.deadlineTime ? <InlineFieldError message={errors.deadlineTime} /> : null}
        </div>

        {/* Priority */}
        <div>
          <span className="block text-[length:var(--fs-ui)] font-medium text-ws-text mb-2">
            Priority
          </span>
          <SegmentedControl
            aria-label="Task priority"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="task-desc-input"
              className="text-[length:var(--fs-ui)] font-medium text-ws-text"
            >
              Description
            </label>
            {description.length >= 1800 ? (
              <span
                className={cn(
                  'text-[length:var(--fs-micro)] tabular-nums',
                  description.length > 2000
                    ? 'text-text-overdue font-medium'
                    : 'text-ws-text-muted',
                )}
              >
                {description.length}/2000
              </span>
            ) : null}
          </div>
          <textarea
            id="task-desc-input"
            rows={4}
            placeholder="Optional notes or context…"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            aria-invalid={Boolean(errors.description)}
            className={cn(
              'w-full min-h-[104px] max-h-[180px] resize-y rounded-item bg-ws-surface border p-3.5 text-[length:var(--fs-ui)] leading-relaxed text-ws-text placeholder:text-ws-text-muted',
              errors.description ? 'border-tint-overdue-border' : 'border-ws-border',
            )}
          />
          {errors.description ? <InlineFieldError message={errors.description} /> : null}
        </div>

        {/* Pinned toggle */}
        <div className="flex items-center justify-between pt-1">
          <label
            htmlFor="task-pinned-switch"
            className="text-[length:var(--fs-ui)] font-medium text-ws-text cursor-pointer"
          >
            Pin to top of the day
          </label>
          <button
            id="task-pinned-switch"
            type="button"
            role="switch"
            aria-checked={pinned}
            onClick={() => setPinned((prev) => !prev)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-pill border transition-colors duration-[var(--dur-fast)] cursor-pointer',
              pinned
                ? 'bg-fill-checkbox-checked border-fill-checkbox-checked'
                : 'bg-ws-accent-soft border-ws-border',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'inline-block h-4 w-4 rounded-pill bg-ws-surface transition-transform duration-[var(--dur-fast)]',
                pinned ? 'translate-x-5' : 'translate-x-1',
              )}
            />
          </button>
        </div>

        {errors.form ? <InlineFieldError message={errors.form} /> : null}
      </form>
    </Drawer>
  );
}

function InlineFieldError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-[length:var(--fs-small)] text-text-overdue"
    >
      <AlertCircle size={14} strokeWidth={1.5} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
