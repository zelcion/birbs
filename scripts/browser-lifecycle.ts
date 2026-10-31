import type { ChildProcess } from 'node:child_process';

/** Observe close without rejecting early on spawn errors; pipes close afterwards. */
export function watchBrowser(browser: ChildProcess, onError: (error: Error) => void, timeoutMs = 30_000) {
  const closed = new Promise<void>((resolve) => {
    browser.once('close', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  browser.on('error', onError);
  const timeout = setTimeout(() => browser.kill('SIGKILL'), timeoutMs);
  return async () => {
    browser.kill();
    await closed;
  };
}

/** Every cleanup runs even if an earlier cleanup fails. */
export async function cleanupBrowserResources(cleanups: Array<() => Promise<unknown>>): Promise<void> {
  const failures: unknown[] = [];
  for (const cleanup of cleanups) {
    try {
      await cleanup();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length) throw new AggregateError(failures, 'Browser smoke cleanup failed');
}
