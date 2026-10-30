// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TaskDto } from '@/contracts';
import { TaskCard } from '@/features/tasks/TaskCard';
import { TaskForm } from '@/features/tasks/TaskForm';

afterEach(() => {
  cleanup();
});

function makeTaskDto(overrides: Partial<TaskDto> = {}): TaskDto {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Implement Celestial Workspace',
    description: overrides.description ?? '',
    priority: overrides.priority ?? 'normal',
    pinned: overrides.pinned ?? false,
    deadlineAt: overrides.deadlineAt ?? '2026-10-30T16:59:00.000Z',
    scheduledDate: overrides.scheduledDate === undefined ? '2026-10-30' : overrides.scheduledDate,
    status: overrides.status ?? 'active',
    completedAt: overrides.completedAt ?? null,
    reminderAt: overrides.reminderAt ?? '2026-10-30T12:00:00.000Z',
    createdAt: overrides.createdAt ?? '2026-10-29T01:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-10-29T01:00:00.000Z',
    isOverdue: overrides.isOverdue ?? false,
    isDueSoon: overrides.isDueSoon ?? false,
    timeLeftMs: overrides.timeLeftMs ?? 3_600_000,
  };
}

describe('TaskCard component states', () => {
  const noop = () => {};

  it('omits description paragraph when description is empty and toggles completion without expanding', () => {
    const onToggle = vi.fn();
    const now = new Date('2026-10-30T10:00:00.000Z');
    const task = makeTaskDto({ description: '' });

    const { container } = render(
      <TaskCard
        task={task}
        now={now}
        onToggleComplete={onToggle}
        onEdit={noop}
        onScheduleDate={noop}
        onOpenPickDate={noop}
        onOpenTransfer={noop}
        onRequestDelete={noop}
      />,
    );

    expect(container.querySelector('p')).toBeNull();
    const checkbox = screen.getByRole('checkbox', {
      name: /Complete Implement Celestial Workspace/i,
    });
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders composable urgent, pinned, due-soon, and overdue labels with text (never colour alone)', () => {
    const dueSoonNow = new Date('2026-10-30T13:00:00.000Z');
    const urgentPinnedTask = makeTaskDto({
      priority: 'urgent',
      pinned: true,
      deadlineAt: '2026-10-30T15:00:00.000Z',
      reminderAt: '2026-10-30T12:00:00.000Z',
    });

    const { rerender } = render(
      <TaskCard
        task={urgentPinnedTask}
        now={dueSoonNow}
        onToggleComplete={noop}
        onEdit={noop}
        onScheduleDate={noop}
        onOpenPickDate={noop}
        onOpenTransfer={noop}
        onRequestDelete={noop}
      />,
    );

    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByLabelText('Pinned to top of day')).toBeInTheDocument();
    expect(screen.getByText('Due soon')).toBeInTheDocument();

    // Advance clock past deadline -> turns overdue live without refetch
    const overdueNow = new Date('2026-10-30T17:00:00.000Z');
    rerender(
      <TaskCard
        task={urgentPinnedTask}
        now={overdueNow}
        context="overdue"
        onToggleComplete={noop}
        onEdit={noop}
        onScheduleDate={noop}
        onOpenPickDate={noop}
        onOpenTransfer={noop}
        onRequestDelete={noop}
      />,
    );

    expect(screen.getByText(/Overdue by 2h/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transfer/i })).toBeInTheDocument();
  });
});

describe('TaskForm validation', () => {
  it('shows inline validation errors for empty title and invalid date/time', async () => {
    const onCreate = vi.fn();
    const now = new Date('2026-10-30T03:00:00.000Z');

    render(
      <TaskForm
        open
        mode="create"
        defaultScheduledDate="2026-10-30"
        now={now}
        onClose={() => {}}
        onCreate={onCreate}
        onUpdate={vi.fn()}
      />,
    );

    const timeInput = screen.getByLabelText(/Deadline time/i);
    fireEvent.change(timeInput, { target: { value: '99:99' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(await screen.findByText('Enter a task title.')).toBeInTheDocument();
    expect(await screen.findByText(/Enter a valid 24-hour time/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
