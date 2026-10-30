import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('projects');

export const metadata: Metadata = {
  title: feature?.title ?? 'In Progress Projects',
};

export default function ProjectsPage() {
  return <BlankPage title={feature?.title ?? 'In Progress Projects'} />;
}
