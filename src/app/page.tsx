import { FEATURE_REGISTRY } from '@/features/registry';
import { TransitionLink } from '@/features/transitions/TransitionLink';
import { PageReady } from '@/features/transitions/TransitionProvider';
import { StarIcon } from '@/ui/StarIcon';

export default function HomePage() {
  return (
    <main
      data-theme="cosmos"
      className="min-h-[100svh] bg-cosmos-bg-0 text-cosmos-text px-[var(--gutter)] lg:px-[var(--gutter-lg)] py-16"
    >
      <PageReady />
      <div className="mx-auto max-w-[var(--max-content)] space-y-10">
        <header className="space-y-3">
          <div className="flex items-center gap-2 text-cosmos-lavender">
            <StarIcon size={14} />
            <span className="font-display italic text-[1.5rem] text-cosmos-text">Hiep Trong</span>
          </div>
          <h1 className="font-display text-[length:var(--fs-display)] leading-[var(--lh-tight)] font-light tracking-[var(--ls-wordmark-mobile)]">
            SPACE
          </h1>
          <p className="text-[length:var(--fs-body)] text-cosmos-text-muted max-w-[var(--max-narrow)]">
            A space for everything I aspire to become.
          </p>
        </header>

        <nav aria-label="Spaces" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURE_REGISTRY.map((feature) => (
            <TransitionLink
              key={feature.id}
              href={feature.href}
              className="flex items-center justify-between rounded-item border border-[color-mix(in_srgb,var(--cosmos-text)_16%,transparent)] px-4 py-3.5 text-cosmos-text hover:border-[color-mix(in_srgb,var(--cosmos-text)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--cosmos-text)_6%,transparent)] transition-colors duration-[var(--dur-fast)]"
            >
              <span className="font-display text-[1.25rem]">{feature.title}</span>
              <span className="text-[length:var(--fs-micro)] text-cosmos-text-muted">
                {feature.label}
              </span>
            </TransitionLink>
          ))}
        </nav>
      </div>
    </main>
  );
}
