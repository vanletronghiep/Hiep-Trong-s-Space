// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getFeatureCollectionLayoutPreference } from '@/client/preferences';
import { FeatureCollection } from '@/features/home/feature-collection/FeatureCollection';
import { FEATURE_REGISTRY } from '@/features/registry';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}));

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('FeatureCollection Horizontal & Vertical modes (§9.9 & ui_readme.md §11)', () => {
  beforeEach(() => {
    const memoryStorage = createMemoryStorage();
    Object.defineProperty(window, 'localStorage', {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all 13 feature cards in registry order in Horizontal fallback mode and switches to Vertical mode with persistence', async () => {
    render(<FeatureCollection />);

    expect(screen.getByRole('heading', { name: 'Explore the space' })).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-native-gallery')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(13);
    FEATURE_REGISTRY.forEach((entry, index) => {
      expect(links[index]).toHaveAttribute('href', entry.href);
      expect(links[index]).toHaveTextContent(entry.title);
      expect(links[index]).toHaveTextContent(entry.label);
    });

    // Switch to Vertical mode
    const verticalRadio = screen.getByRole('radio', { name: 'Vertical' });
    fireEvent.click(verticalRadio);

    await waitFor(() => {
      expect(screen.getByTestId('vertical-feature-grid')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('horizontal-native-gallery')).not.toBeInTheDocument();
    expect(getFeatureCollectionLayoutPreference()).toBe('vertical');

    const verticalLinks = screen.getAllByRole('link');
    expect(verticalLinks).toHaveLength(13);

    // Remount -> restores persisted 'vertical' mode
    cleanup();
    render(<FeatureCollection />);
    await waitFor(() => {
      expect(screen.getByTestId('vertical-feature-grid')).toBeInTheDocument();
    });
  });

  it('activates the pinned scroll-linked stage on desktop (>=1024px) with fine pointer and motion enabled', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(min-width: 1024px)' || query === '(pointer: fine)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    render(<FeatureCollection />);

    await waitFor(() => {
      expect(screen.getByTestId('horizontal-pinned-outer')).toBeInTheDocument();
    });
    expect(screen.getByTestId('horizontal-pinned-track')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(13);
  });
});
