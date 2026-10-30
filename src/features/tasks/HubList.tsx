'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { Plus, Search, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import {
  useCompleteTask,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useTransferTask,
  useUncompleteTask,
  useUpdateTask,
} from '@/client/queries/tasks';
import { useMinuteTicker } from '@/client/use-minute-ticker';
import type { CreateTaskInput, Priority, TaskDto, UpdateTaskInput } from '@/contracts';
import { formatDayColumnHeader } from '@/domain/date-input';
import { compareTasks } from '@/domain/task-sort';
import { deriveTaskState } from '@/domain/task-status';
import { DEFAULT_APP_TIMEZONE } from '@/domain/time';
import { PageReady } from '@/features/transitions/TransitionProvider';
import { Badge, type BadgeTone } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { ConfirmDialog } from '@/ui/Dialog';
import { EmptyState } from '@/ui/EmptyState';
import { SegmentedControl, type SegmentedOption } from '@/ui/SegmentedControl';
import { Skeleton } from '@/ui/Skeleton';
import { useToast } from '@/ui/Toast';
import { WorkspacePageHeader } from '@/ui/WorkspaceShell';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { ScheduleDateDialog, TransferDialog } from './TransferDialog';

type PriorityFilter = 'all' | Priority;
type HubSortMode = 'deadline' | 'priority';

const PRIORITY_FILTER_OPTIONS: readonly SegmentedOption<PriorityFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'normal', label: 'Normal' },
  { value: 'optional', label: 'Optional' },
];

function sortByDeadlineThenPriority(tasks: readonly TaskDto[]): TaskDto[] {
  return [...tasks].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    const deadlineDiff = differenceInMilliseconds(parseISO(a.deadlineAt), parseISO(b.deadlineAt));
    if (deadlineDiff !== 0) {
      return deadlineDiff;
    }
    return compareTasks(a, b);
  });
}

export function HubList() {
  const now = useMinuteTicker();
  const timeZone = DEFAULT_APP_TIMEZONE;
  const searchParams = useSearchParams();
  const { pushToast } = useToast();

  const targetTaskParam = searchParams.get('task');

  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortMode, setSortMode] = useState<HubSortMode>('deadline');
  const [showCompleted, setShowCompleted] = useState(false);

  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    task: TaskDto | null;
  }>({
    open: false,
    mode: 'create',
    task: null,
  });

  const [transferTarget, setTransferTarget] = useState<TaskDto | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<TaskDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskDto | null>(null);
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  const tasksQuery = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const transferTask = useTransferTask();
  const deleteTask = useDeleteTask();

  const allTasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  // Handle ?task=<id> highlight & auto-reveal completed group if target is completed (§9.4)
  useEffect(() => {
    if (!targetTaskParam || allTasks.length === 0) {
      return;
    }
    const target = allTasks.find((t) => t.id === targetTaskParam);
    if (!target) {
      return;
    }
    if (target.status === 'completed') {
      setShowCompleted(true);
    }
    setHighlightedTaskId(target.id);
    const timer = window.setTimeout(() => {
      setHighlightedTaskId((prev) => (prev === target.id ? null : prev));
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [targetTaskParam, allTasks]);

  const filteredTasks = useMemo(() => {
    const needle = searchText.trim().toLocaleLowerCase();
    return allTasks.filter((task) => {
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      if (needle) {
        const matchesTitle = task.title.toLocaleLowerCase().includes(needle);
        const matchesDesc = task.description.toLocaleLowerCase().includes(needle);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [allTasks, priorityFilter, searchText]);

  const sortGroup = (items: readonly TaskDto[]): TaskDto[] => {
    if (sortMode === 'priority') {
      return [...items].sort(compareTasks);
    }
    return sortByDeadlineThenPriority(items);
  };

  const { overdueTasks, dueSoonTasks, laterTasks, completedTasks } = useMemo(() => {
    const overdue: TaskDto[] = [];
    const dueSoon: TaskDto[] = [];
    const later: TaskDto[] = [];
    const completed: TaskDto[] = [];

    for (const task of filteredTasks) {
      if (task.status === 'completed') {
        completed.push(task);
        continue;
      }
      const derived = deriveTaskState(task, now);
      if (derived.isOverdue) {
        overdue.push(task);
      } else if (derived.isDueSoon) {
        dueSoon.push(task);
      } else {
        later.push(task);
      }
    }

    return {
      overdueTasks: sortGroup(overdue),
      dueSoonTasks: sortGroup(dueSoon),
      laterTasks: sortGroup(later),
      completedTasks: [...completed].sort((a, b) => {
        if (a.completedAt && b.completedAt) {
          return differenceInMilliseconds(parseISO(b.completedAt), parseISO(a.completedAt));
        }
        return compareTasks(a, b);
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTasks, now, sortMode]);

  const activeTotal = overdueTasks.length + dueSoonTasks.length + laterTasks.length;
  const hasFilters = searchText.trim().length > 0 || priorityFilter !== 'all';

  const handleToggleComplete = (task: TaskDto) => {
    if (task.status === 'completed') {
      uncompleteTask.mutate(task.id, {
        onError: (err) => pushToast(err.message, 'error'),
      });
    } else {
      completeTask.mutate(task.id, {
        onError: (err) => pushToast(err.message, 'error'),
      });
    }
  };

  const handleScheduleDate = (task: TaskDto, scheduledDate: string | null) => {
    updateTask.mutate(
      { id: task.id, input: { scheduledDate } },
      {
        onSuccess: () => {
          pushToast(
            scheduledDate === null
              ? 'Removed from daily schedule.'
              : `Added to ${formatDayColumnHeader(scheduledDate, timeZone).dayMonth}.`,
            'success',
          );
        },
        onError: (err) => pushToast(err.message, 'error'),
      },
    );
  };

  const handleCreateTask = async (input: CreateTaskInput): Promise<TaskDto> => {
    const created = await createTask.mutateAsync(input);
    setRecentlyCreatedId(created.id);
    window.setTimeout(() => {
      setRecentlyCreatedId((prev) => (prev === created.id ? null : prev));
    }, 1500);
    pushToast('Task added to hub.', 'success');
    return created;
  };

  const handleUpdateTask = async (id: string, input: UpdateTaskInput): Promise<TaskDto> => {
    const updated = await updateTask.mutateAsync({ id, input });
    pushToast('Task updated.', 'success');
    return updated;
  };

  const handleTransferSubmit = async (
    taskId: string,
    payload: { scheduledDate: string; deadlineAt: string },
  ) => {
    await transferTask.mutateAsync({ id: taskId, input: payload });
    pushToast('Overdue task transferred.', 'success');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteTask.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        pushToast('Task deleted.', 'info');
      },
      onError: (err) => pushToast(err.message, 'error'),
    });
  };

  const renderGroup = (options: {
    id: string;
    title: string;
    badgeTone: BadgeTone;
    items: readonly TaskDto[];
    muted?: boolean;
  }) => {
    if (options.items.length === 0) {
      return null;
    }

    return (
      <section
        key={options.id}
        aria-labelledby={`hub-group-${options.id}`}
        className={options.muted ? 'pt-6 border-t border-ws-border opacity-90' : 'space-y-3'}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <h2
            id={`hub-group-${options.id}`}
            className="font-display text-[length:var(--fs-h2)] leading-[var(--lh-heading)] font-medium text-ws-text"
          >
            {options.title}
          </h2>
          <Badge tone={options.badgeTone} className="tabular-nums">
            {options.items.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AnimatePresence initial={false}>
            {options.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                now={now}
                timeZone={timeZone}
                context="hub"
                isNew={recentlyCreatedId === task.id}
                isHighlighted={highlightedTaskId === task.id}
                onToggleComplete={handleToggleComplete}
                onEdit={(target) =>
                  setFormState({
                    open: true,
                    mode: 'edit',
                    task: target,
                  })
                }
                onScheduleDate={handleScheduleDate}
                onOpenPickDate={(target) => setScheduleTarget(target)}
                onOpenTransfer={(target) => setTransferTarget(target)}
                onRequestDelete={(target) => setDeleteTarget(target)}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col flex-1">
      <PageReady ready={!tasksQuery.isLoading} />

      <WorkspacePageHeader
        title="Tasks hub"
        description="Every task across your universe, grouped by urgency and kept in sync with Daily tasks."
        actions={
          <Button
            variant="primary"
            pill
            leftIcon={<Plus size={16} strokeWidth={1.75} />}
            onClick={() =>
              setFormState({
                open: true,
                mode: 'create',
                task: null,
              })
            }
          >
            Add task
          </Button>
        }
      />

      {/* Search & filter controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pb-6 mb-2 border-b border-ws-border">
        <div className="relative flex-1 max-w-[380px]">
          <Search
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ws-text-muted"
          />
          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search tasks…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full h-10 rounded-pill bg-ws-surface border border-ws-border pl-10 pr-9 text-[length:var(--fs-ui)] text-ws-text placeholder:text-ws-text-muted"
          />
          {searchText ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded-pill text-ws-text-muted hover:text-ws-text hover:bg-ws-accent-soft cursor-pointer"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <SegmentedControl
            aria-label="Filter by priority"
            options={PRIORITY_FILTER_OPTIONS}
            value={priorityFilter}
            onChange={setPriorityFilter}
          />

          <Chip
            active={sortMode === 'priority'}
            onClick={() => setSortMode((m) => (m === 'deadline' ? 'priority' : 'deadline'))}
          >
            {sortMode === 'deadline' ? 'Sorted by deadline' : 'Sorted by priority'}
          </Chip>

          <Chip active={showCompleted} onClick={() => setShowCompleted((v) => !v)}>
            Show completed ({allTasks.filter((t) => t.status === 'completed').length})
          </Chip>
        </div>
      </div>

      {tasksQuery.isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-6">
          {[0, 1, 2, 3].map((idx) => (
            <Skeleton key={idx} className="h-28 w-full" />
          ))}
        </div>
      ) : tasksQuery.isError ? (
        <div className="rounded-card bg-ws-surface border border-tint-overdue-border p-6 text-center my-6">
          <p className="text-[length:var(--fs-body)] font-medium text-text-overdue">
            Unable to load tasks
          </p>
          <div className="mt-4">
            <Button variant="primary" pill onClick={() => void tasksQuery.refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 py-4">
          {activeTotal === 0 ? (
            hasFilters ? (
              <EmptyState
                title="No tasks match your filters."
                description="Try clearing the search query or switching the priority filter."
                action={
                  <Button
                    variant="secondary"
                    pill
                    onClick={() => {
                      setSearchText('');
                      setPriorityFilter('all');
                    }}
                  >
                    Reset filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                title="No active tasks in your hub."
                description="Tasks created here stay unscheduled until you place them onto a day."
                action={
                  <Button
                    variant="primary"
                    pill
                    leftIcon={<Plus size={15} strokeWidth={1.75} />}
                    onClick={() =>
                      setFormState({
                        open: true,
                        mode: 'create',
                        task: null,
                      })
                    }
                  >
                    Add task
                  </Button>
                }
              />
            )
          ) : (
            <>
              {renderGroup({
                id: 'overdue',
                title: 'Overdue',
                badgeTone: 'overdue',
                items: overdueTasks,
              })}
              {renderGroup({
                id: 'due-soon',
                title: 'Due soon',
                badgeTone: 'due-soon',
                items: dueSoonTasks,
              })}
              {renderGroup({
                id: 'later',
                title: 'Later',
                badgeTone: 'count',
                items: laterTasks,
              })}
            </>
          )}

          {showCompleted
            ? renderGroup({
                id: 'completed',
                title: 'Completed',
                badgeTone: 'completed',
                items: completedTasks,
                muted: true,
              })
            : null}
        </div>
      )}

      {/* Shared TaskForm Drawer (no scheduledDate when created in Hub!) */}
      <TaskForm
        open={formState.open}
        mode={formState.mode}
        initialTask={formState.task}
        defaultScheduledDate={
          formState.mode === 'edit' ? (formState.task?.scheduledDate ?? null) : null
        }
        now={now}
        timeZone={timeZone}
        isSubmitting={createTask.isPending || updateTask.isPending}
        onClose={() => setFormState((prev) => ({ ...prev, open: false }))}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
      />

      <TransferDialog
        task={transferTarget}
        open={transferTarget !== null}
        onClose={() => setTransferTarget(null)}
        onSubmitTransfer={handleTransferSubmit}
        now={now}
        timeZone={timeZone}
        isSubmitting={transferTask.isPending}
      />

      <ScheduleDateDialog
        task={scheduleTarget}
        open={scheduleTarget !== null}
        onClose={() => setScheduleTarget(null)}
        onSelectDate={async (taskId, scheduledDate) => {
          await updateTask.mutateAsync({ id: taskId, input: { scheduledDate } });
          pushToast(
            `Added to ${formatDayColumnHeader(scheduledDate, timeZone).dayMonth}.`,
            'success',
          );
        }}
        now={now}
        timeZone={timeZone}
        isSubmitting={updateTask.isPending}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete task?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed from Tasks hub, Daily tasks, and notifications.`
            : ''
        }
        isSubmitting={deleteTask.isPending}
      />
    </div>
  );
}
