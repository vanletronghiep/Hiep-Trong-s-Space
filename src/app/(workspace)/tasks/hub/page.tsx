import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('tasks-hub');

export const metadata: Metadata = {
  title: feature?.title ?? 'Tasks Hub',
};

export default function TasksHubPage() {
  return <BlankPage title={feature?.title ?? 'Tasks Hub'} />;
}
