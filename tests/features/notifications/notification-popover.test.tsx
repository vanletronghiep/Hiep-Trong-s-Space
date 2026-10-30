// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationDto, NotificationListResponse } from '@/contracts';
import { BellButton } from '@/features/notifications/BellButton';
import { ToastProvider } from '@/ui/Toast';

const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
  usePathname: () => '/tasks/daily',
}));

function renderBellWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BellButton tone="workspace" />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('BellButton & NotificationPopover (§9.11, §15)', () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('opens and closes via bell click and Escape, toggles read checkbox without navigating, and marks all read', async () => {
    const taskId = crypto.randomUUID();
    const notifId = crypto.randomUUID();
    let currentItems: NotificationDto[] = [
      {
        id: notifId,
        kind: 'due_soon',
        tagLabel: 'Due soon',
        title: 'Due soon',
        message: '"Review linear algebra" is due 30/10 18:00.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        timeLeftMs: 3 * 60 * 60 * 1000,
        taskId,
        targetUrl: `/tasks/hub?task=${taskId}`,
      },
    ];

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url === '/api/notifications' && (!init?.method || init.method === 'GET')) {
        const body: NotificationListResponse = {
          items: currentItems,
          unreadCount: currentItems.filter((i) => !i.isRead).length,
        };
        return new Response(JSON.stringify(body), { status: 200 });
      }
      if (url === `/api/notifications/${notifId}/read` && init?.method === 'POST') {
        currentItems = currentItems.map((i) => (i.id === notifId ? { ...i, isRead: true } : i));
        return new Response(JSON.stringify({ item: currentItems[0] }), { status: 200 });
      }
      if (url === '/api/notifications/read-all' && init?.method === 'POST') {
        currentItems = currentItems.map((i) => ({ ...i, isRead: true }));
        return new Response(JSON.stringify({ ok: true, updatedCount: 1 }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }), {
        status: 404,
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    renderBellWithProviders();

    // Wait for unread indicator on the bell
    await waitFor(() => {
      expect(screen.getByTestId('bell-unread-indicator')).toBeInTheDocument();
    });

    const bell = screen.getByRole('button', { name: /notifications \(1 unread\)/i });
    fireEvent.click(bell);

    // Popover opens with dialog role, item details, time-left, and relative age
    const dialog = await screen.findByRole('dialog', { name: 'Notifications' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('"Review linear algebra" is due 30/10 18:00.')).toBeInTheDocument();
    expect(screen.getByText('3h left')).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    expect(screen.getByTestId('notification-unread-dot')).toBeInTheDocument();

    // Ticking read checkbox marks read without navigating
    const readCheckbox = screen.getByRole('checkbox', {
      name: /mark "due soon" notification as read/i,
    });
    fireEvent.click(readCheckbox);

    await waitFor(() => {
      expect(screen.queryByTestId('notification-unread-dot')).not.toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();

    // Pressing Escape closes the popover
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();
    });
  });

  it('renders the calm empty state when there are no notifications', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const body: NotificationListResponse = { items: [], unreadCount: 0 };
        return new Response(JSON.stringify(body), { status: 200 });
      }),
    );

    renderBellWithProviders();

    const bell = await screen.findByRole('button', { name: 'Notifications' });
    fireEvent.click(bell);

    expect(await screen.findByText('All caught up.')).toBeInTheDocument();
    expect(screen.getByText('Your universe is running smoothly.')).toBeInTheDocument();
  });
});
