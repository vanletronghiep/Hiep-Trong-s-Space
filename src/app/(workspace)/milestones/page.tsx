import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('milestones');

export const metadata: Metadata = {
  title: feature?.title ?? 'Annual Milestones',
};

export default function MilestonesPage() {
  return <BlankPage title={feature?.title ?? 'Annual Milestones'} />;
}
