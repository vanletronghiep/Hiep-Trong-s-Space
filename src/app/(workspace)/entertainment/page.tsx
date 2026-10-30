import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('entertainment');

export const metadata: Metadata = {
  title: feature?.title ?? 'Entertainment Hub',
};

export default function EntertainmentPage() {
  return <BlankPage title={feature?.title ?? 'Entertainment Hub'} />;
}
