import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('daily-tasks');

export const metadata: Metadata = {
  title: feature?.title ?? 'Daily Task Management',
};

export default function DailyTasksPage() {
  return <BlankPage title={feature?.title ?? 'Daily Task Management'} />;
}
