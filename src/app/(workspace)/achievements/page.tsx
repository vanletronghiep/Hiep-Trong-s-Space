import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('achievements');

export const metadata: Metadata = {
  title: feature?.title ?? 'Personal Achievements',
};

export default function AchievementsPage() {
  return <BlankPage title={feature?.title ?? 'Personal Achievements'} />;
}
