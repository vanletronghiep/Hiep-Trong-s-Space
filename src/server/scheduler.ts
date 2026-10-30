import { getAppConfig } from './config';
import { getContainer } from './container';
import { logger } from './logger';

const ONE_HOUR_MS = 60 * 60 * 1000;

interface GlobalWithScheduler {
  __htsSchedulerStarted?: boolean;
}

const globalForScheduler = globalThis as unknown as GlobalWithScheduler;

async function safeRunReminderTick(): Promise<void> {
  try {
    const { notificationService } = await getContainer();
    await notificationService.runReminderTick();
  } catch (error: unknown) {
    logger.error('Scheduler reminder tick failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function safePurgeExpired(): Promise<void> {
  try {
    const { notificationService } = await getContainer();
    await notificationService.purgeExpired();
  } catch (error: unknown) {
    logger.error('Scheduler notification purge failed', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Starts the in-process reminder and retention scheduler (§6.10).
 * Guarded via `globalThis` so Next.js dev hot-reloads never spawn duplicate timers.
 */
export function startScheduler(): void {
  if (globalForScheduler.__htsSchedulerStarted) {
    return;
  }
  globalForScheduler.__htsSchedulerStarted = true;

  const config = getAppConfig();
  const tickIntervalMs = Math.max(5_000, config.schedulerTickSeconds * 1000);

  void (async () => {
    await safePurgeExpired();
    await safeRunReminderTick();
  })();

  const tickTimer = setInterval(() => {
    void safeRunReminderTick();
  }, tickIntervalMs);
  tickTimer.unref?.();

  const purgeTimer = setInterval(() => {
    void safePurgeExpired();
  }, ONE_HOUR_MS);
  purgeTimer.unref?.();
}
