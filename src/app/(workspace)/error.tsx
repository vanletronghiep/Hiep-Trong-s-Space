'use client';

import { PageReady } from '@/features/transitions/TransitionProvider';
import { Button } from '@/ui/Button';
import { StarIcon } from '@/ui/StarIcon';

export default function WorkspaceErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-16 px-4 text-center">
      <PageReady />
      <StarIcon size={14} className="text-status-overdue mb-4" />
      <h1 className="font-display text-[length:var(--fs-h1)] leading-[var(--lh-heading)] font-normal text-ws-text">
        Unable to load this workspace
      </h1>
      <p className="mt-2 max-w-[var(--max-narrow)] text-[length:var(--fs-ui)] text-ws-text-muted">
        {error.message || 'Please try reloading this view.'}
      </p>
      <div className="mt-6">
        <Button variant="primary" pill onClick={reset}>
          Try again
        </Button>
      </div>
    </section>
  );
}
