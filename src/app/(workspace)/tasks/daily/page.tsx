import type { Metadata } from 'next';
import { getFeatureById } from '@/features/registry';
import { DailyBoard } from '@/features/tasks/DailyBoard';

const feature = getFeatureById('daily-tasks');

export const metadata: Metadata = {
  title: feature?.title ?? 'Daily Task Management',
};

export default function DailyTasksPage() {
  return <DailyBoard />;
}
