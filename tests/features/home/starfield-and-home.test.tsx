// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '@/features/home/Hero';
import { LetsGoButton } from '@/features/home/LetsGoButton';
import {
  StarfieldEngine,
  computeTargetStarCount,
} from '@/features/home/starfield/starfield-engine';
import { Wordmark } from '@/features/home/Wordmark';
import { ToastProvider } from '@/ui/Toast';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}));

function createMockCanvasContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    lineCap: 'round',
    strokeStyle: '',
    fillStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D;
}

describe('Homepage StarfieldEngine, Wordmark, and LetsGoButton (§9.5–§9.8)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('scales target star count across mobile, tablet, and desktop viewports', () => {
    const mobile = computeTargetStarCount(390, 844, 8);
    const tablet = computeTargetStarCount(820, 1180, 8);
    const desktop = computeTargetStarCount(1440, 900, 8);
    const lowCpuDesktop = computeTargetStarCount(1440, 900, 2);

    expect(mobile).toBeGreaterThanOrEqual(650);
    expect(mobile).toBeLessThanOrEqual(950);
    expect(tablet).toBeGreaterThan(mobile);
    expect(desktop).toBeGreaterThan(tablet);
    expect(desktop).toBeGreaterThanOrEqual(2200);
    expect(lowCpuDesktop).toBeLessThan(desktop);
  });

  it('renders a single static frame without starting RAF loop under reducedMotion and cleans up safely', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'clientWidth', { value: 1280 });
    Object.defineProperty(canvas, 'clientHeight', { value: 800 });
    const mockCtx = createMockCanvasContext();
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

    const engine = new StarfieldEngine({
      canvas,
      reducedMotion: true,
    });

    engine.start();
    expect(rafSpy).not.toHaveBeenCalled();
    expect(mockCtx.clearRect).toHaveBeenCalled();

    const highCount = engine.getActiveStarCount();
    engine.setQuality('medium');
    expect(engine.getActiveStarCount()).toBeLessThan(highCount);

    engine.setSpeedMultiplier(12);
    expect(engine.getSpeedMultiplier()).toBe(8);
    engine.stepFrame(0.016);

    // Double destroy is safe (Strict Mode)
    engine.destroy();
    engine.destroy();
  });

  it('renders Wordmark with accessible name "Hiep Trong Space" and real selectable text', () => {
    render(<Wordmark />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Hiep Trong Space' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Hiep Trong');
    expect(heading).toHaveTextContent('SPACE');
  });

  it('smooth-scrolls to #features on "Let\'s go" click without mutating URL hash', () => {
    const scrollIntoViewMock = vi.fn();
    const targetSection = document.createElement('section');
    targetSection.id = 'features';
    targetSection.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(targetSection);

    render(<LetsGoButton />);

    const btn = screen.getByRole('button', { name: "Let's go" });
    fireEvent.click(btn);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(window.location.hash).toBe('');

    document.body.removeChild(targetSection);
  });

  it('renders Hero with top-right BellButton and LetsGoButton plus statement and tagline', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(JSON.stringify({ items: [], unreadCount: 0 }), { status: 200 }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Hero />
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Hiep Trong Space' })).toBeInTheDocument();
    expect(screen.getByText('A space for everything I aspire to become.')).toBeInTheDocument();
    expect(
      screen.getByText('Ideas, projects, and ambitions — in one quiet place.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Let's go" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });
});
