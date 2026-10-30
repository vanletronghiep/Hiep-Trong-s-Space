import type { Metadata } from 'next';
import { BlankPage } from '@/features/blank/BlankPage';
import { getFeatureById } from '@/features/registry';

const feature = getFeatureById('flashcards');

export const metadata: Metadata = {
  title: feature?.title ?? 'Flashcards',
};

export default function FlashcardsPage() {
  return <BlankPage title={feature?.title ?? 'Flashcards'} />;
}
