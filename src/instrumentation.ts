import { isNodeRuntime } from '@/server/config';

export async function register(): Promise<void> {
  if (isNodeRuntime()) {
    const { startScheduler } = await import('@/server/scheduler');
    startScheduler();
  }
}
