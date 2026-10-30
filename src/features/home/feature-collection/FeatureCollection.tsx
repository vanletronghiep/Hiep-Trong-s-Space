'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getFeatureCollectionLayoutPreference,
  setFeatureCollectionLayoutPreference,
  type FeatureCollectionLayout,
} from '@/client/preferences';
import { FEATURE_REGISTRY } from '@/features/registry';
import { HorizontalGallery } from './HorizontalGallery';
import { VerticalGrid } from './VerticalGrid';

export function FeatureCollection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState<FeatureCollectionLayout>('horizontal');

  useEffect(() => {
    setLayout(getFeatureCollectionLayoutPreference());
  }, []);

  const handleLayoutChange = (next: FeatureCollectionLayout) => {
    if (next === layout) {
      return;
    }
    setLayout(next);
    setFeatureCollectionLayoutPreference(next);

    // Keep user anchored at the start of the collection so switching out of pinned horizontal
    // never strands the scroll position below the shortened section (§9.9 & ui_readme.md §11.7).
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView?.({ behavior: 'auto', block: 'start' });
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="features"
      aria-labelledby="features-heading"
      className="relative w-full scroll-mt-4"
    >
      {layout === 'horizontal' ? (
        <HorizontalGallery
          features={FEATURE_REGISTRY}
          layout={layout}
          onLayoutChange={handleLayoutChange}
        />
      ) : (
        <VerticalGrid
          features={FEATURE_REGISTRY}
          layout={layout}
          onLayoutChange={handleLayoutChange}
        />
      )}
    </section>
  );
}
