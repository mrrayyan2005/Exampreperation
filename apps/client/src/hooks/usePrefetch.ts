import { useCallback } from 'react';
import { lazyLoadCache } from '@/utils/lazyLoad';

/**
 * Hook for programmatic prefetching
 * 
 * Usage:
 * const { prefetch } = usePrefetch();
 * 
 * // Later:
 * prefetch('/dashboard');
 */
export function usePrefetch() {
  const prefetch = useCallback((path: string) => {
    if (lazyLoadCache.has(path)) {
      const importFn = lazyLoadCache.get(path);
      if (importFn) {
        importFn().catch(() => {
          // Silently fail
        });
      }
    }
  }, []);

  return { prefetch };
}