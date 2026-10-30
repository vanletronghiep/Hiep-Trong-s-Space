// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  normalizePathname,
  parseInternalHref,
  shouldTriggerCosmicLaunch,
} from '@/features/transitions/transition-rules';
import { TransitionLink } from '@/features/transitions/TransitionLink';
import { PageReady, TransitionProvider } from '@/features/transitions/TransitionProvider';
import { ToastProvider } from '@/ui/Toast';

let mockedPathname = '/';
const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => mockedPathname,
}));

describe('Cosmic Launch page transition (§9.10 & Epic 7)', () => {
  beforeEach(() => {
    mockedPathname = '/';
    pushMock.mockReset();
    replaceMock.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.style.overflow = '';
    document.documentElement.removeAttribute('aria-busy');
  });

  it('evaluates Cosmic Launch eligibility accurately across pathname, query, hash, external, and double-click cases', () => {
    expect(normalizePathname('/tasks/hub/')).toBe('/tasks/hub');
    expect(parseInternalHref('https://google.com')).toBeNull();
    expect(parseInternalHref('#features')).toBeNull();
    expect(parseInternalHref('//evil.example')).toBeNull();

    // Different pathname -> triggers
    expect(
      shouldTriggerCosmicLaunch({
        href: '/tasks/daily',
        currentPathname: '/',
        isTransitioning: false,
      }),
    ).toBe(true);

    // Different pathname with query -> triggers
    expect(
      shouldTriggerCosmicLaunch({
        href: '/tasks/hub?task=123',
        currentPathname: '/tasks/daily',
        isTransitioning: false,
      }),
    ).toBe(true);

    // Same pathname with query change -> does NOT trigger Cosmic Launch
    expect(
      shouldTriggerCosmicLaunch({
        href: '/tasks/hub?task=123',
        currentPathname: '/tasks/hub',
        isTransitioning: false,
      }),
    ).toBe(false);

    // Same pathname with hash -> does NOT trigger Cosmic Launch
    expect(
      shouldTriggerCosmicLaunch({
        href: '/#features',
        currentPathname: '/',
        isTransitioning: false,
      }),
    ).toBe(false);

    // Already transitioning (double-click) -> ignored
    expect(
      shouldTriggerCosmicLaunch({
        href: '/events',
        currentPathname: '/',
        isTransitioning: true,
      }),
    ).toBe(false);
  });

  it('plays the 4-phase timeline, ignores double-clicks, holds on slow destination until PageReady, and restores focus', () => {
    function TestHarness({ destReady }: { destReady: boolean }) {
      return (
        <ToastProvider>
          <TransitionProvider>
            <main>
              <h1>{mockedPathname === '/' ? 'Home' : 'Daily tasks'}</h1>
              <TransitionLink href="/tasks/daily">Go daily</TransitionLink>
              <TransitionLink href="/events">Go events</TransitionLink>
              {mockedPathname === '/tasks/daily' ? <PageReady ready={destReady} /> : null}
            </main>
          </TransitionProvider>
        </ToastProvider>
      );
    }

    const { rerender } = render(<TestHarness destReady={false} />);

    // Click Go daily -> Phase 1 Departure starts immediately
    fireEvent.click(screen.getByRole('link', { name: 'Go daily' }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/tasks/daily');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.documentElement.getAttribute('aria-busy')).toBe('true');

    const overlay = screen.getByTestId('cosmic-launch-overlay');
    expect(overlay).toHaveAttribute('data-phase', 'departure');
    expect(screen.getByTestId('cosmic-launch-spacecraft')).toBeInTheDocument();

    // Repeated / competing click while running is ignored
    fireEvent.click(screen.getByRole('link', { name: 'Go events' }));
    expect(pushMock).toHaveBeenCalledTimes(1);

    // Simulate router updating pathname to /tasks/daily, but data is STILL loading (destReady = false)
    mockedPathname = '/tasks/daily';
    rerender(<TestHarness destReady={false} />);

    // 500ms -> Phase 2 Ignition
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId('cosmic-launch-overlay')).toHaveAttribute('data-phase', 'ignition');

    // 1300ms -> Phase 3 Acceleration
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByTestId('cosmic-launch-overlay')).toHaveAttribute(
      'data-phase',
      'acceleration',
    );

    // 2300ms -> Slow-page test: destination has NOT signalled PageReady yet, so overlay holds!
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('cosmic-launch-overlay')).toHaveAttribute('data-phase', 'holding');

    // Even 1200ms later (3500ms total), overlay still holds smoothly without revealing incomplete page
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getByTestId('cosmic-launch-overlay')).toHaveAttribute('data-phase', 'holding');

    // Destination finishes loading data -> signals PageReady(true) -> immediately enters Phase 4 Arrival
    rerender(<TestHarness destReady={true} />);
    expect(screen.getByTestId('cosmic-launch-overlay')).toHaveAttribute('data-phase', 'arrival');

    // After 700ms Arrival fade-out -> overlay unmounts and scroll unlocks
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(screen.queryByTestId('cosmic-launch-overlay')).not.toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.documentElement.hasAttribute('aria-busy')).toBe(false);
  });

  it('uses a <= 300ms plain opacity crossfade without spacecraft when prefers-reduced-motion is active', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    render(
      <ToastProvider>
        <TransitionProvider>
          <main>
            <h1>Home</h1>
            <TransitionLink href="/events">Open events</TransitionLink>
          </main>
        </TransitionProvider>
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Open events' }));
    expect(pushMock).toHaveBeenCalledWith('/events');
    expect(screen.getByTestId('cosmic-launch-quick-fade')).toBeInTheDocument();
    expect(screen.queryByTestId('cosmic-launch-spacecraft')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByTestId('cosmic-launch-quick-fade')).not.toBeInTheDocument();
  });

  it('navigates directly without mounting Cosmic Launch for same-path query updates', () => {
    mockedPathname = '/tasks/hub';

    render(
      <ToastProvider>
        <TransitionProvider>
          <main>
            <h1>Tasks hub</h1>
            <TransitionLink href="/tasks/hub?task=abc">Highlight task</TransitionLink>
          </main>
        </TransitionProvider>
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Highlight task' }));
    expect(pushMock).toHaveBeenCalledWith('/tasks/hub?task=abc');
    expect(screen.queryByTestId('cosmic-launch-overlay')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cosmic-launch-quick-fade')).not.toBeInTheDocument();
  });
});
