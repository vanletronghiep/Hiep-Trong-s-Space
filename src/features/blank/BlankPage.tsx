import { TransitionLink } from '@/features/transitions/TransitionLink';
import { PageReady } from '@/features/transitions/TransitionProvider';
import { StarIcon } from '@/ui/StarIcon';

export interface BlankPageProps {
  title: string;
}

export function BlankPage({ title }: BlankPageProps) {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center py-16 text-center overflow-hidden">
      <PageReady />

      {/* Faint concentric orbit rings (~220px and ~320px) per ui_readme.md §13.2 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="h-[220px] w-[220px] rounded-pill border border-ws-accent-soft" />
        <span className="absolute h-[320px] w-[320px] rounded-pill border border-ws-accent-soft opacity-70" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-[var(--max-narrow)] px-4">
        <StarIcon size={14} className="text-ws-accent mb-4" />
        <h1 className="font-display text-[length:var(--fs-display)] leading-[var(--lh-heading)] font-normal text-ws-text">
          {title}
        </h1>
        <p className="mt-3 text-[length:var(--fs-body)] text-ws-text-muted">
          This space is waiting to be built.
        </p>
        <div className="mt-7">
          <TransitionLink
            href="/"
            className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-pill bg-ws-accent-soft text-ws-text border border-ws-border text-[length:var(--fs-ui)] font-medium whitespace-nowrap hover:bg-[color-mix(in_srgb,var(--ws-accent)_35%,var(--ws-surface))] transition-colors duration-[var(--dur-fast)]"
          >
            Back to home
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
