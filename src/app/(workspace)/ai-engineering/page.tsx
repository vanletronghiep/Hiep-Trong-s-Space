import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('ai-engineering');

export const metadata: Metadata = {
  title: feature?.title ?? 'AI Engineering',
};

export default function AiEngineeringPage() {
  return <BlankPage title={feature?.title ?? 'AI Engineering'} />;
}
