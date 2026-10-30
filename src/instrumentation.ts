export async function register(): Promise<void> {
  // Next.js compiler uses static dead-code elimination on process.env.NEXT_RUNTIME
  // to avoid bundling Node-only native modules in edge / browser runtimes.
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startScheduler } = await import('@/server/scheduler');
    startScheduler();
  }
}
