import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('learning-room');

export const metadata: Metadata = {
  title: feature?.title ?? 'Learning Room',
};

export default function LearningRoomPage() {
  return <BlankPage title={feature?.title ?? 'Learning Room'} />;
}
