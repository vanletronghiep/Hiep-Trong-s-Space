import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('blogs');

export const metadata: Metadata = {
  title: feature?.title ?? 'Blogs Hub',
};

export default function BlogsPage() {
  return <BlankPage title={feature?.title ?? 'Blogs Hub'} />;
}
