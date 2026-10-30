import { FeatureCollection } from '@/features/home/feature-collection/FeatureCollection';
import { Hero } from '@/features/home/Hero';
import { HomeFooter } from '@/features/home/HomeFooter';
import { Starfield } from '@/features/home/starfield/Starfield';
import { PageReady } from '@/features/transitions/TransitionProvider';

export default function HomePage() {
  return (
    <div
      data-theme="cosmos"
      className="relative min-h-[100svh] w-full overflow-x-clip text-cosmos-text"
      style={{
        background:
          'linear-gradient(180deg, var(--cosmos-bg-0) 0%, var(--cosmos-bg-1) 60%, var(--cosmos-bg-2) 100%)',
      }}
    >
      <PageReady />

      {/* Subtle atmospheric radial lights (<= 6% icy blue upper-right, <= 4% navy/lavender lower-left) per ui_readme.md §10.1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 'var(--z-bg)',
          background: [
            'radial-gradient(ellipse 55% 45% at 82% 16%, color-mix(in srgb, var(--cosmos-star-blue) 5%, transparent), transparent 72%)',
            'radial-gradient(ellipse 60% 50% at 18% 84%, color-mix(in srgb, var(--cosmos-lavender) 3.5%, transparent), transparent 75%)',
          ].join(', '),
        }}
      />

      {/* Fixed 2D Canvas 3D-perspective starfield */}
      <div style={{ zIndex: 'var(--z-bg)' }} className="pointer-events-none fixed inset-0">
        <Starfield mode="absolute" />
      </div>

      {/* Foreground content above starfield */}
      <main style={{ zIndex: 'var(--z-content)' }} className="relative flex flex-col">
        <Hero />
        <FeatureCollection />
        <HomeFooter />
      </main>
    </div>
  );
}
