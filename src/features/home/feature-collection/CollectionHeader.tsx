'use client';

import type { FeatureCollectionLayout } from '@/client/preferences';
import { SegmentedControl, type SegmentedOption } from '@/ui/SegmentedControl';
import { cn } from '@/ui/cn';

const LAYOUT_OPTIONS: readonly SegmentedOption<FeatureCollectionLayout>[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

export interface CollectionHeaderProps {
  layout: FeatureCollectionLayout;
  onLayoutChange: (next: FeatureCollectionLayout) => void;
  className?: string;
}

export function CollectionHeader({ layout, onLayoutChange, className }: CollectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="space-y-2">
        <h2
          id="features-heading"
          className="font-display text-[length:var(--fs-display)] font-light leading-[var(--lh-heading)] text-cosmos-text"
        >
          Explore the space
        </h2>
        <p className="text-[length:var(--fs-body)] text-cosmos-text-muted max-w-[var(--max-narrow)]">
          Thirteen places, each with its own purpose.
        </p>
      </div>

      <SegmentedControl
        tone="cosmos"
        aria-label="Feature collection layout"
        options={LAYOUT_OPTIONS}
        value={layout}
        onChange={onLayoutChange}
      />
    </div>
  );
}
