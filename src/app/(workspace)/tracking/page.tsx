import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('tracking');

export const metadata: Metadata = {
  title: feature?.title ?? 'Tracking',
};

export default function TrackingPage() {
  return <BlankPage title={feature?.title ?? 'Tracking'} />;
}
