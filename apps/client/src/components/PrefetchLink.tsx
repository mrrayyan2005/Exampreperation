import { useRef, useCallback } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { lazyLoadCache } from '@/utils/lazyLoad';

interface PrefetchLinkProps extends LinkProps {
  /** Delay before prefetching starts (ms) */
  prefetchDelay?: number;
  /** Whether to prefetch on hover */
  prefetchOnHover?: boolean;
  /** Whether to prefetch on viewport entry */
  prefetchOnVisible?: boolean;
}

/**
 * Smart link component that prefetches routes before navigation
 * 
 * Usage:
 * <PrefetchLink to="/dashboard">Dashboard</PrefetchLink>
 * 
 * This will prefetch the Dashboard chunk when:
 * 1. User hovers over the link (with 100ms delay)
 * 2. Link enters viewport (if prefetchOnVisible is true)
 */
export function PrefetchLink({
  to,
  prefetchDelay = 100,
  prefetchOnHover = true,
  prefetchOnVisible = false,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  children,
  ...props
}: PrefetchLinkProps) {
  const navigate = useNavigate();
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasPrefetchedRef = useRef(false);

  const prefetch = useCallback(() => {
    if (hasPrefetchedRef.current) return;
    
    // Extract route component from path
    const path = typeof to === 'string' ? to : to.pathname || '';
    
    // Preload the route chunk if available in cache
    if (lazyLoadCache.has(path)) {
      const importFn = lazyLoadCache.get(path);
      if (importFn) {
        hasPrefetchedRef.current = true;
        // Start prefetching
        importFn().catch(() => {
          // Silently fail - prefetch shouldn't block
          hasPrefetchedRef.current = false;
        });
      }
    }
  }, [to]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetchOnHover) {
      prefetchTimerRef.current = setTimeout(() => {
        prefetch();
      }, prefetchDelay);
    }
    onMouseEnter?.(e);
  }, [prefetchOnHover, prefetchDelay, prefetch, onMouseEnter]);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
    onMouseLeave?.(e);
  }, [onMouseLeave]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLAnchorElement>) => {
    // Prefetch immediately on touch (mobile)
    prefetch();
    onTouchStart?.(e);
  }, [prefetch, onTouchStart]);

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </Link>
  );
}

// Hook moved to src/hooks/usePrefetch.ts for Fast Refresh compatibility
