'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { FeatureCollectionLayout } from '@/client/preferences';
import { MOTION_DURATION, MOTION_EASE } from '@/design/motion';
import type { FeatureEntry } from '@/features/registry';
import { CollectionHeader } from './CollectionHeader';
import { FeatureCard } from './FeatureCard';

export interface VerticalGridProps {
  features: readonly FeatureEntry[];
  layout: FeatureCollectionLayout;
  onLayoutChange: (next: FeatureCollectionLayout) => void;
}

/**
 * Traditional 2-column (>=768px) / 1-column (<768px) Vertical layout
 * with content height only and zero sticky/spacer/scroll listeners (§9.9 & ui_readme.md §11.6).
 */
export function VerticalGrid({ features, layout, onLayoutChange }: VerticalGridProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div data-testid="vertical-feature-grid" className="w-full py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[var(--max-content)] px-[var(--gutter)] lg:px-[var(--gutter-lg)]">
        <CollectionHeader layout={layout} onLayoutChange={onLayoutChange} />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: reducedMotion ? 0 : MOTION_DURATION.reveal,
                delay: reducedMotion ? 0 : (index % 2) * 0.1,
                ease: MOTION_EASE,
              }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
