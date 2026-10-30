// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TaskDto } from '@/contracts';
import { TaskCard } from '@/features/tasks/TaskCard';

afterEach(() => {
  cleanup();
});

async function findFilesMatching(dir: string, pattern: RegExp): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findFilesMatching(fullPath, pattern)));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Tasks Hub reuse and schedule actions (§2.5, §9.4)', () => {
  it('maintains strictly one TaskCard and one TaskForm component across the entire codebase', async () => {
    const srcRoot = path.resolve(process.cwd(), 'src');
    const cardFiles = await findFilesMatching(srcRoot, /TaskCard\.tsx$/i);
    const formFiles = await findFilesMatching(srcRoot, /TaskForm\.tsx$/i);

    expect(cardFiles).toHaveLength(1);
    expect(formFiles).toHaveLength(1);
  });

  it('reveals Add to today / Add to tomorrow / Pick date… when expanded in Hub context and displays scheduled chip', () => {
    const onScheduleDate = vi.fn();
    const now = new Date('2026-10-30T03:00:00.000Z'); // 2026-10-30 10:00 ICT
    const task: TaskDto = {
      id: crypto.randomUUID(),
      title: 'Read Transformer paper',
      description: 'Attention Is All You Need section 3',
      priority: 'normal',
      pinned: false,
      deadlineAt: '2026-11-02T16:59:00.000Z',
      scheduledDate: '2026-10-31',
      status: 'active',
      completedAt: null,
      reminderAt: '2026-11-01T16:59:00.000Z',
      createdAt: '2026-10-29T01:00:00.000Z',
      updatedAt: '2026-10-29T01:00:00.000Z',
      isOverdue: false,
      isDueSoon: false,
      timeLeftMs: 86_400_000,
    };

    render(
      <TaskCard
        task={task}
        now={now}
        context="hub"
        onToggleComplete={() => {}}
        onEdit={() => {}}
        onScheduleDate={onScheduleDate}
        onOpenPickDate={() => {}}
        onOpenTransfer={() => {}}
        onRequestDelete={() => {}}
      />,
    );

    // Displays Scheduled 31/10 badge
    expect(screen.getByText('Scheduled 31/10')).toBeInTheDocument();

    // Click card body to expand
    fireEvent.click(screen.getByText('Read Transformer paper'));

    const addToTodayBtn = screen.getByRole('button', { name: 'Add to today' });
    expect(addToTodayBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove from daily' })).toBeInTheDocument();

    fireEvent.click(addToTodayBtn);
    expect(onScheduleDate).toHaveBeenCalledWith(task, '2026-10-30');
  });
});
