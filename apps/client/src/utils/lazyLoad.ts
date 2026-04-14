import { lazy, ComponentType } from 'react';

/** Track retry attempts per module path to avoid infinite reload loops */
const RETRY_KEY = 'chunk-load-retry-count';
const MAX_RETRIES = 2;

/** Cache for lazy-loaded components to enable prefetching */
export const lazyLoadCache = new Map<string, () => Promise<{ default: ComponentType<any> }>>();

/**
 * Preload framer-motion to prevent context race conditions
 * This ensures framer-motion's internal context is initialized before
 * any lazy-loaded components try to use it.
 */
async function preloadFramerMotion(): Promise<void> {
  try {
    // Preload framer-motion to ensure its context is ready
    await import('framer-motion');
  } catch {
    // Ignore preload errors - the actual import will handle it
  }
}

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Importing a module script failed') ||
    error.message.includes('Unable to preload CSS') ||
    (error as any).code === 'MODULE_NOT_FOUND'
  );
}

function getRetryCount(): number {
  try {
    return parseInt(sessionStorage.getItem(RETRY_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

function incrementRetryCount(): void {
  try {
    sessionStorage.setItem(RETRY_KEY, String(getRetryCount() + 1));
  } catch {
    // sessionStorage not available
  }
}

function clearRetryCount(): void {
  try {
    sessionStorage.removeItem(RETRY_KEY);
  } catch {
    // sessionStorage not available
  }
}

/**
 * A robust wrapper around React.lazy that:
 * 1. Handles "Failed to fetch dynamically imported module" errors with auto-reload
 * 2. Limits retries to prevent infinite reload loops
 * 3. Clears stale caches before retrying
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  options?: { preloadFramerMotion?: boolean; cacheKey?: string }
) {
  // Store in cache for prefetching if cacheKey provided
  if (options?.cacheKey) {
    lazyLoadCache.set(options.cacheKey, async () => {
      const component = await importFn();
      return (component as any).default
        ? (component as { default: T })
        : { default: component as T };
    });
  }

  return lazy(async () => {
    try {
      // Preload framer-motion if needed to prevent context race conditions
      if (options?.preloadFramerMotion !== false) {
        await preloadFramerMotion();
      }
      
      const component = await importFn();
      // Reset retry counter on successful load
      clearRetryCount();
      return (component as any).default
        ? (component as { default: T })
        : { default: component as T };
    } catch (error) {
      console.error('[lazyLoad] Chunk load failed:', error);

      if (isChunkLoadError(error)) {
        const retryCount = getRetryCount();

        if (retryCount < MAX_RETRIES) {
          incrementRetryCount();
          console.warn(`[lazyLoad] Retrying... attempt ${retryCount + 1}/${MAX_RETRIES}`);

          // Clear any stale caches before reloading
          if ('caches' in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            } catch {
              // caches API not available
            }
          }

          window.location.reload();
          // Return a never-resolving promise since we're about to reload
          return new Promise<{ default: T }>(() => {});
        } else {
          console.error('[lazyLoad] Max retries reached. Giving up.');
          clearRetryCount();
        }
      }

      throw error;
    }
  });
}
