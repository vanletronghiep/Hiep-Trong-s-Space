'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Bell, Command } from 'lucide-react';
import { TransitionLink } from '@/features/transitions/TransitionLink';
import { IconButton } from './IconButton';
import { StarIcon } from './StarIcon';
import { UniverseMenu } from './UniverseMenu';
import { cn } from './cn';

export interface WorkspaceShellProps {
  children: ReactNode;
  bellSlot?: ReactNode;
}

export function WorkspaceShell({ children, bellSlot }: WorkspaceShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [universeOpen, setUniverseOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setUniverseOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      data-theme="workspace"
      className="relative min-h-[100svh] bg-ws-bg text-ws-text flex flex-col"
    >
      {/* Faint top lavender ambient wash (≤ 8%, fading by ~40vh) per ui_readme.md §13.1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[40vh]"
        style={{
          zIndex: 'var(--z-bg)',
          background:
            'radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--ws-accent) 8%, transparent), transparent 75%)',
        }}
      />

      <header
        style={{ zIndex: 'var(--z-nav)', height: 'var(--topbar-h)' }}
        className={cn(
          'sticky top-0 w-full bg-[color-mix(in_srgb,var(--ws-bg)_92%,transparent)] backdrop-blur-sm transition-[border-color] duration-[var(--dur-fast)]',
          scrolled ? 'border-b border-ws-border' : 'border-b border-transparent',
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[var(--max-content)] items-center justify-between px-[var(--gutter)] lg:px-[var(--gutter-lg)]">
          <TransitionLink
            href="/"
            aria-label="Hiep Trong Space home"
            className="inline-flex items-center gap-1.5 rounded-pill px-2 py-1 -ml-2 text-ws-text hover:opacity-80 transition-opacity duration-[var(--dur-fast)]"
          >
            <span className="font-display italic text-[1.375rem] leading-none">Hiep Trong</span>
            <StarIcon size={10} className="text-ws-accent" />
          </TransitionLink>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUniverseOpen(true)}
              aria-label="Open universe menu"
              aria-haspopup="dialog"
              aria-expanded={universeOpen}
              className="inline-flex items-center gap-2 min-h-[36px] px-3.5 rounded-pill bg-ws-accent-soft text-ws-text border border-ws-border text-[length:var(--fs-small)] font-medium whitespace-nowrap cursor-pointer hover:bg-[color-mix(in_srgb,var(--ws-accent)_35%,var(--ws-surface))] transition-colors duration-[var(--dur-fast)]"
            >
              <Command size={14} strokeWidth={1.5} className="shrink-0" />
              <span>Universe</span>
              <span
                aria-hidden="true"
                className="hidden md:inline-block ml-0.5 text-[length:var(--fs-micro)] text-ws-text-muted"
              >
                Ctrl K
              </span>
            </button>

            {bellSlot ?? (
              <IconButton aria-label="Notifications" tone="workspace">
                <Bell size={20} strokeWidth={1.5} />
              </IconButton>
            )}
          </div>
        </div>
      </header>

      <main
        style={{ zIndex: 'var(--z-content)' }}
        className="relative flex-1 mx-auto flex flex-col w-full max-w-[var(--max-content)] px-[var(--gutter)] lg:px-[var(--gutter-lg)] py-8"
      >
        {children}
      </main>

      <UniverseMenu open={universeOpen} onClose={() => setUniverseOpen(false)} />
    </div>
  );
}

export interface WorkspacePageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function WorkspacePageHeader({ title, description, actions }: WorkspacePageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-[length:var(--fs-h1)] leading-[var(--lh-heading)] font-normal text-ws-text">
            {title}
          </h1>
          <StarIcon size={12} className="text-ws-accent" />
        </div>
        {description ? (
          <p className="text-[length:var(--fs-ui)] text-ws-text-muted max-w-[var(--max-narrow)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}
