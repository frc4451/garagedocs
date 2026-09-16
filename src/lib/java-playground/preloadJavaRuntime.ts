import type { StatusFn } from './types';

/**
 * Start the Java runtime (worker, CheerpJ, staged JDK, compiler server) without
 * compiling anything. Called from the page-head startup script as soon as the
 * document is parsed and again by the React islands on hydration; the runner
 * shares one init promise, so repeated calls join the start in progress.
 */
export function preloadJavaRuntimeSoon(onStatus?: StatusFn): Promise<void> {
  return import('./cheerpjRunner').then((mod) => {
    if (typeof window !== 'undefined') {
      (window as unknown as { __jpDumpResources?: typeof mod.dumpCheerpjResources }).__jpDumpResources =
        mod.dumpCheerpjResources;
    }
    return mod.preloadJavaRuntime(onStatus);
  });
}
