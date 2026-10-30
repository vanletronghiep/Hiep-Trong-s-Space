import { Hero } from '@/features/home/Hero';
import { HomeFooter } from '@/features/home/HomeFooter';
import { Starfield } from '@/features/home/starfield/Starfield';
import { FEATURE_REGISTRY } from '@/features/registry';
import { TransitionLink } from '@/features/transitions/TransitionLink';
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

        {/* Temporary #features section placeholder until Epic 6 upgrades it to HorizontalGallery & VerticalGrid */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="scroll-mt-8 px-[var(--gutter)] lg:px-[var(--gutter-lg)] py-20"
        >
          <div className="mx-auto max-w-[var(--max-content)] space-y-8">
            <div className="space-y-2">
              <h2
                id="features-heading"
                className="font-display text-[length:var(--fs-display)] font-light leading-[var(--lh-heading)] text-cosmos-text"
              >
                Explore the space
              </h2>
              <p className="text-[length:var(--fs-body)] text-cosmos-text-muted">
                Thirteen places, each with its own purpose.
              </p>
            </div>

            <nav aria-label="Spaces" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURE_REGISTRY.map((feature) => (
                <TransitionLink
                  key={feature.id}
                  href={feature.href}
                  className="flex items-center justify-between rounded-card border border-[color-mix(in_srgb,var(--cosmos-text)_14%,transparent)] bg-[color-mix(in_srgb,var(--cosmos-bg-0)_45%,transparent)] px-5 py-4 text-cosmos-text hover:border-[color-mix(in_srgb,var(--cosmos-text)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--cosmos-text)_6%,transparent)] transition-colors duration-[var(--dur-fast)]"
                >
                  <span className="font-display text-[length:var(--fs-card-title)] font-light">
                    {feature.title}
                  </span>
                  <span className="text-[length:var(--fs-micro)] text-cosmos-text-muted ml-4 shrink-0">
                    {feature.label}
                  </span>
                </TransitionLink>
              ))}
            </nav>
          </div>
        </section>

        <HomeFooter />
      </main>
    </div>
  );
}
