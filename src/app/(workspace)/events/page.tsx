import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('events');

export const metadata: Metadata = {
  title: feature?.title ?? 'Events',
};

export default function EventsPage() {
  return <BlankPage title={feature?.title ?? 'Events'} />;
}
