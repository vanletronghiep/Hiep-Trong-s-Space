'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import {
  getDailyViewPreference,
  setDailyViewPreference,
  type DailyViewMode,
} from '@/client/preferences';
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
import type { CreateTaskInput, TaskDto, UpdateTaskInput } from '@/contracts';
import { formatDayColumnHeader, getMonthCalendarCells, getWeekDates } from '@/domain/date-input';
import { sortTasks } from '@/domain/task-sort';
import { DEFAULT_APP_TIMEZONE, formatScheduledDate, shiftScheduledDate } from '@/domain/time';
import { PageReady } from '@/features/transitions/TransitionProvider';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/Dialog';
import { Drawer } from '@/ui/Drawer';
import { EmptyState } from '@/ui/EmptyState';
import { IconButton } from '@/ui/IconButton';
import { SegmentedControl, type SegmentedOption } from '@/ui/SegmentedControl';
import { Skeleton } from '@/ui/Skeleton';
import { useToast } from '@/ui/Toast';
import { WorkspacePageHeader } from '@/ui/WorkspaceShell';
import { cn } from '@/ui/cn';
import { FinishedCounter } from './FinishedCounter';
import { MonthView } from './MonthView';
import { OverdueList } from './OverdueList';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { ScheduleDateDialog, TransferDialog } from './TransferDialog';
import { WeekView } from './WeekView';

const VIEW_OPTIONS: readonly SegmentedOption<DailyViewMode>[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

type DayTabKey = 'yesterday' | 'today' | 'tomorrow';

export function DailyBoard() {
  const now = useMinuteTicker();
  const timeZone = DEFAULT_APP_TIMEZONE;
  const { pushToast } = useToast();

  const todayStr = formatScheduledDate(now, timeZone);
  const yesterdayStr = shiftScheduledDate(todayStr, -1, timeZone);
  const tomorrowStr = shiftScheduledDate(todayStr, 1, timeZone);

  const [viewMode, setViewMode] = useState<DailyViewMode>('day');
  const [mobileDayTab, setMobileDayTab] = useState<DayTabKey>('today');
  const [weekAnchorDate, setWeekAnchorDate] = useState<string>(todayStr);
  const [monthAnchorDate, setMonthAnchorDate] = useState<string>(todayStr);
  const [statsOpen, setStatsOpen] = useState(false);

  // Editor / Dialog state
  const [formState, setFormState] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    task: TaskDto | null;
    defaultScheduledDate: string | null;
  }>({
    open: false,
    mode: 'create',
    task: null,
    defaultScheduledDate: todayStr,
  });

  const [transferTarget, setTransferTarget] = useState<TaskDto | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<TaskDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskDto | null>(null);
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(null);

  useEffect(() => {
    setViewMode(getDailyViewPreference());
  }, []);

  const handleViewChange = (nextMode: DailyViewMode) => {
    setViewMode(nextMode);
    setDailyViewPreference(nextMode);
  };

  const tasksQuery = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();
  const transferTask = useTransferTask();
  const deleteTask = useDeleteTask();

  const allTasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  const markRecentlyCreated = (id: string) => {
    setRecentlyCreatedId(id);
    window.setTimeout(() => {
      setRecentlyCreatedId((prev) => (prev === id ? null : prev));
    }, 1500);
  };

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
              ? 'Removed from daily view.'
              : `Scheduled for ${formatDayColumnHeader(scheduledDate, timeZone).dayMonth}.`,
            'success',
          );
        },
        onError: (err) => pushToast(err.message, 'error'),
      },
    );
  };

  const handleCreateTask = async (input: CreateTaskInput): Promise<TaskDto> => {
    const created = await createTask.mutateAsync(input);
    markRecentlyCreated(created.id);
    pushToast('Task added.', 'success');
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
    const id = deleteTarget.id;
    deleteTask.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
        pushToast('Task deleted.', 'info');
      },
      onError: (err) => {
        pushToast(err.message, 'error');
      },
    });
  };

  const dayColumns = useMemo(
    () =>
      [
        {
          key: 'yesterday' as const,
          label: 'Yesterday',
          scheduledDate: yesterdayStr,
          canAdd: false,
          emptyCopy: 'No tasks for yesterday.',
        },
        {
          key: 'today' as const,
          label: 'Today',
          scheduledDate: todayStr,
          canAdd: true,
          emptyCopy: 'No tasks for today.',
        },
        {
          key: 'tomorrow' as const,
          label: 'Tomorrow',
          scheduledDate: tomorrowStr,
          canAdd: true,
          emptyCopy: 'No tasks for tomorrow.',
        },
      ] as const,
    [yesterdayStr, todayStr, tomorrowStr],
  );

  const weekLabel = useMemo(() => {
    const dates = getWeekDates(weekAnchorDate, timeZone);
    const first = dates[0];
    const last = dates[6];
    if (!first || !last) return '';
    return `${formatDayColumnHeader(first, timeZone).dayMonth} – ${formatDayColumnHeader(last, timeZone).dayMonth}`;
  }, [weekAnchorDate, timeZone]);

  const monthLabel = useMemo(
    () => getMonthCalendarCells(monthAnchorDate, timeZone).monthLabel,
    [monthAnchorDate, timeZone],
  );

  const shiftMonthAnchor = (deltaMonths: number) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(monthAnchorDate);
    if (!match) return;
    let year = Number(match[1]);
    let month = Number(match[2]) + deltaMonths;
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    while (month > 12) {
      month -= 12;
      year += 1;
    }
    setMonthAnchorDate(`${year}-${String(month).padStart(2, '0')}-01`);
  };

  return (
    <div className="flex flex-col flex-1">
      <PageReady ready={!tasksQuery.isLoading} />

      <WorkspacePageHeader
        title="Daily tasks"
        description="Yesterday, today, and tomorrow — kept calm and clear."
        actions={
          <>
            {viewMode === 'week' ? (
              <div className="inline-flex items-center gap-1 mr-1">
                <IconButton
                  size="sm"
                  aria-label="Previous week"
                  onClick={() => setWeekAnchorDate((d) => shiftScheduledDate(d, -7, timeZone))}
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </IconButton>
                <button
                  type="button"
                  onClick={() => setWeekAnchorDate(todayStr)}
                  className="px-2.5 h-8 rounded-pill text-[length:var(--fs-small)] font-medium text-ws-text hover:bg-ws-accent-soft tabular-nums cursor-pointer"
                >
                  {weekLabel}
                </button>
                <IconButton
                  size="sm"
                  aria-label="Next week"
                  onClick={() => setWeekAnchorDate((d) => shiftScheduledDate(d, 7, timeZone))}
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </IconButton>
              </div>
            ) : null}

            {viewMode === 'month' ? (
              <div className="inline-flex items-center gap-1 mr-1">
                <IconButton
                  size="sm"
                  aria-label="Previous month"
                  onClick={() => shiftMonthAnchor(-1)}
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </IconButton>
                <button
                  type="button"
                  onClick={() => setMonthAnchorDate(todayStr)}
                  className="px-2.5 h-8 rounded-pill text-[length:var(--fs-small)] font-medium text-ws-text hover:bg-ws-accent-soft cursor-pointer"
                >
                  {monthLabel}
                </button>
                <IconButton size="sm" aria-label="Next month" onClick={() => shiftMonthAnchor(1)}>
                  <ChevronRight size={16} strokeWidth={1.5} />
                </IconButton>
              </div>
            ) : null}

            <SegmentedControl
              aria-label="Daily view mode"
              options={VIEW_OPTIONS}
              value={viewMode}
              onChange={handleViewChange}
            />

            <Button
              variant="secondary"
              pill
              size="sm"
              leftIcon={<BarChart3 size={15} strokeWidth={1.5} />}
              onClick={() => setStatsOpen(true)}
            >
              Statistics
            </Button>
          </>
        }
      />

      {tasksQuery.isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {[0, 1, 2].map((col) => (
            <div key={col} className="space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : tasksQuery.isError ? (
        <div className="rounded-card bg-ws-surface border border-tint-overdue-border p-6 text-center my-4">
          <p className="text-[length:var(--fs-body)] font-medium text-text-overdue">
            Unable to load tasks
          </p>
          <p className="mt-1 text-[length:var(--fs-small)] text-ws-text-muted">
            {tasksQuery.error instanceof Error
              ? tasksQuery.error.message
              : 'Please check your local server.'}
          </p>
          <div className="mt-4">
            <Button variant="primary" pill onClick={() => void tasksQuery.refetch()}>
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'day' ? (
            <>
              {/* Mobile/Tablet 3-day tab strip (< 1024px) */}
              <div
                role="tablist"
                aria-label="Select day"
                className="flex lg:hidden items-center p-1 mb-5 rounded-pill bg-[color-mix(in_srgb,var(--ws-text)_4%,var(--ws-bg))] border border-ws-border"
              >
                {dayColumns.map((col) => {
                  const isSelected = mobileDayTab === col.key;
                  const header = formatDayColumnHeader(col.scheduledDate, timeZone);
                  return (
                    <button
                      key={col.key}
                      type="button"
                      role="tab"
                      id={`day-tab-${col.key}`}
                      aria-selected={isSelected}
                      aria-controls={`day-panel-${col.key}`}
                      onClick={() => setMobileDayTab(col.key)}
                      className={cn(
                        'flex-1 min-h-[36px] px-3 rounded-pill text-[length:var(--fs-small)] font-medium transition-colors duration-[var(--dur-fast)] cursor-pointer',
                        isSelected
                          ? 'bg-ws-surface text-ws-text shadow-task border border-ws-border'
                          : 'text-ws-text-muted hover:text-ws-text',
                      )}
                    >
                      {col.label} · <span className="tabular-nums">{header.dayMonth}</span>
                    </button>
                  );
                })}
              </div>

              {/* Three equal columns on desktop (≥ 1024px), active tab panel on < 1024px */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {dayColumns.map((col) => {
                  const isToday = col.key === 'today';
                  const isYesterday = col.key === 'yesterday';
                  const isVisibleMobile = mobileDayTab === col.key;
                  const header = formatDayColumnHeader(col.scheduledDate, timeZone);
                  const columnTasks = sortTasks(
                    allTasks.filter((t) => t.scheduledDate === col.scheduledDate),
                  );
                  const completedCount = columnTasks.filter((t) => t.status === 'completed').length;

                  return (
                    <section
                      key={col.key}
                      id={`day-panel-${col.key}`}
                      aria-label={`${col.label} (${header.dayMonth})`}
                      className={cn(
                        'flex-col min-h-[300px]',
                        isVisibleMobile ? 'flex' : 'hidden lg:flex',
                        isToday &&
                          'rounded-card bg-[color-mix(in_srgb,var(--ws-accent)_6%,transparent)] p-3.5 -mx-2 lg:-m-3.5',
                      )}
                    >
                      <header
                        className={cn(
                          'flex items-center justify-between gap-2 pb-3 mb-3.5 border-b',
                          isToday ? 'border-ws-accent' : 'border-ws-border',
                          isYesterday && 'opacity-90',
                        )}
                      >
                        <div className="flex items-baseline gap-2 min-w-0">
                          <h2 className="text-[length:var(--fs-ui)] font-semibold text-ws-text truncate">
                            {col.label}
                          </h2>
                          <span className="text-[length:var(--fs-small)] text-ws-text-muted tabular-nums shrink-0">
                            {header.shortWeekday} {header.dayMonth}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <FinishedCounter count={completedCount} />
                          {col.canAdd ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              pill
                              leftIcon={<Plus size={14} strokeWidth={1.75} />}
                              onClick={() =>
                                setFormState({
                                  open: true,
                                  mode: 'create',
                                  task: null,
                                  defaultScheduledDate: col.scheduledDate,
                                })
                              }
                            >
                              Add task
                            </Button>
                          ) : null}
                        </div>
                      </header>

                      {columnTasks.length === 0 ? (
                        <EmptyState compact title={col.emptyCopy} />
                      ) : (
                        <div className="flex flex-col gap-3">
                          <AnimatePresence initial={false}>
                            {columnTasks.map((task) => (
                              <TaskCard
                                key={task.id}
                                task={task}
                                now={now}
                                timeZone={timeZone}
                                context="daily"
                                isNew={recentlyCreatedId === task.id}
                                onToggleComplete={handleToggleComplete}
                                onEdit={(target) =>
                                  setFormState({
                                    open: true,
                                    mode: 'edit',
                                    task: target,
                                    defaultScheduledDate: target.scheduledDate,
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
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          ) : null}

          {viewMode === 'week' ? (
            <WeekView
              anchorDate={weekAnchorDate}
              tasks={allTasks}
              now={now}
              timeZone={timeZone}
              recentlyCreatedId={recentlyCreatedId}
              onToggleComplete={handleToggleComplete}
              onEdit={(target) =>
                setFormState({
                  open: true,
                  mode: 'edit',
                  task: target,
                  defaultScheduledDate: target.scheduledDate,
                })
              }
              onScheduleDate={handleScheduleDate}
              onOpenPickDate={(target) => setScheduleTarget(target)}
              onOpenTransfer={(target) => setTransferTarget(target)}
              onRequestDelete={(target) => setDeleteTarget(target)}
            />
          ) : null}

          {viewMode === 'month' ? (
            <MonthView
              anchorDate={monthAnchorDate}
              tasks={allTasks}
              now={now}
              timeZone={timeZone}
              recentlyCreatedId={recentlyCreatedId}
              onToggleComplete={handleToggleComplete}
              onEdit={(target) =>
                setFormState({
                  open: true,
                  mode: 'edit',
                  task: target,
                  defaultScheduledDate: target.scheduledDate,
                })
              }
              onScheduleDate={handleScheduleDate}
              onOpenPickDate={(target) => setScheduleTarget(target)}
              onOpenTransfer={(target) => setTransferTarget(target)}
              onRequestDelete={(target) => setDeleteTarget(target)}
            />
          ) : null}

          <OverdueList
            tasks={allTasks}
            now={now}
            timeZone={timeZone}
            recentlyCreatedId={recentlyCreatedId}
            onToggleComplete={handleToggleComplete}
            onEdit={(target) =>
              setFormState({
                open: true,
                mode: 'edit',
                task: target,
                defaultScheduledDate: target.scheduledDate,
              })
            }
            onScheduleDate={handleScheduleDate}
            onOpenPickDate={(target) => setScheduleTarget(target)}
            onOpenTransfer={(target) => setTransferTarget(target)}
            onRequestDelete={(target) => setDeleteTarget(target)}
          />
        </>
      )}

      {/* Shared Add / Edit Drawer */}
      <TaskForm
        open={formState.open}
        mode={formState.mode}
        initialTask={formState.task}
        defaultScheduledDate={formState.defaultScheduledDate}
        now={now}
        timeZone={timeZone}
        isSubmitting={createTask.isPending || updateTask.isPending}
        onClose={() => setFormState((prev) => ({ ...prev, open: false }))}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
      />

      {/* Transfer Overdue Task Dialog */}
      <TransferDialog
        task={transferTarget}
        open={transferTarget !== null}
        onClose={() => setTransferTarget(null)}
        onSubmitTransfer={handleTransferSubmit}
        now={now}
        timeZone={timeZone}
        isSubmitting={transferTask.isPending}
      />

      {/* Pick Schedule Date Dialog */}
      <ScheduleDateDialog
        task={scheduleTarget}
        open={scheduleTarget !== null}
        onClose={() => setScheduleTarget(null)}
        onSelectDate={async (taskId, scheduledDate) => {
          await updateTask.mutateAsync({ id: taskId, input: { scheduledDate } });
          pushToast(
            `Scheduled for ${formatDayColumnHeader(scheduledDate, timeZone).dayMonth}.`,
            'success',
          );
        }}
        now={now}
        timeZone={timeZone}
        isSubmitting={updateTask.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete task?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed from Daily tasks, Tasks hub, and notifications.`
            : ''
        }
        isSubmitting={deleteTask.isPending}
      />

      {/* Statistics Placeholder Drawer (§2.9 & §9.3) */}
      <Drawer open={statsOpen} onClose={() => setStatsOpen(false)} title="Statistics">
        <EmptyState
          title="Statistics will live here."
          description="Completion history is already being recorded so your personal insights will be ready when specified."
        />
      </Drawer>
    </div>
  );
}
