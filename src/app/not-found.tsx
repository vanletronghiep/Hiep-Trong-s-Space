import { TransitionLink } from '@/features/transitions/TransitionLink';
import { PageReady } from '@/features/transitions/TransitionProvider';
import { StarIcon } from '@/ui/StarIcon';

export default function NotFoundPage() {
  return (
    <main className="min-h-[100svh] bg-ws-bg text-ws-text flex flex-col items-center justify-center px-6 text-center">
      <PageReady />
      <StarIcon size={14} className="text-ws-accent mb-4" />
      <h1 className="font-display text-[length:var(--fs-display)] leading-[var(--lh-heading)] font-normal">
        Uncharted coordinates
      </h1>
      <p className="mt-3 max-w-[var(--max-narrow)] text-[length:var(--fs-ui)] text-ws-text-muted">
        The page you are looking for does not exist in Hiep Trong Space.
      </p>
      <div className="mt-7">
        <TransitionLink
          href="/"
          className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-pill bg-ws-accent-soft text-ws-text border border-ws-border text-[length:var(--fs-ui)] font-medium hover:bg-[color-mix(in_srgb,var(--ws-accent)_35%,var(--ws-surface))] transition-colors duration-[var(--dur-fast)]"
        >
          Back to home
        </TransitionLink>
      </div>
    </main>
  );
}
