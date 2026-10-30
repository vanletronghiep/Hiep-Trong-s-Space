'use client';

import { TransitionLink } from '@/features/transitions/TransitionLink';
import { Button } from '@/ui/Button';
import { StarIcon } from '@/ui/StarIcon';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[100svh] bg-ws-bg text-ws-text flex flex-col items-center justify-center px-6 text-center">
      <StarIcon size={14} className="text-status-overdue mb-4" />
      <h1 className="font-display text-[length:var(--fs-display)] leading-[var(--lh-heading)] font-normal">
        Something drifted off course
      </h1>
      <p className="mt-3 max-w-[var(--max-narrow)] text-[length:var(--fs-ui)] text-ws-text-muted">
        {error.message || 'An unexpected error interrupted this page.'}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" pill onClick={reset}>
          Try again
        </Button>
        <TransitionLink
          href="/"
          className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-pill bg-ws-accent-soft text-ws-text border border-ws-border text-[length:var(--fs-ui)] font-medium"
        >
          Back to home
        </TransitionLink>
      </div>
    </main>
  );
}
