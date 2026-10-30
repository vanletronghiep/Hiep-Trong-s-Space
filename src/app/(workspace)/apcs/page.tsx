import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('apcs');

export const metadata: Metadata = {
  title: feature?.title ?? 'APCS Hub',
};

export default function ApcsPage() {
  return <BlankPage title={feature?.title ?? 'APCS Hub'} />;
}
