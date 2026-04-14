import React from 'react';
import { cn } from '@/lib/utils';

export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="flex gap-2 sm:gap-3 rounded-xl border border-border/60 bg-card overflow-hidden animate-pulse"
        >
          {/* Vote Column */}
          <div className="flex-shrink-0 w-10 sm:w-12 py-2 sm:py-4 bg-muted/30 flex flex-col items-center gap-2">
            <div className="h-5 w-5 bg-muted/60 rounded" />
            <div className="h-3 w-4 bg-muted/60 rounded" />
            <div className="h-5 w-5 bg-muted/60 rounded" />
          </div>

          {/* Main Content */}
          <div className="flex-1 py-3 pr-4 space-y-3">
            {/* Header: Badges */}
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-muted/60 rounded-full" />
              <div className="h-4 w-12 bg-muted/60 rounded-full" />
            </div>

            {/* Title Line */}
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-muted/60 rounded-md" />
              <div className="h-5 w-1/2 bg-muted/60 rounded-md" />
            </div>

            {/* Body Lines */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full bg-muted/40 rounded-md" />
              <div className="h-3 w-full bg-muted/40 rounded-md" />
              <div className="h-3 w-4/5 bg-muted/40 rounded-md" />
            </div>

            {/* Footer Metadata */}
            <div className="flex items-center gap-2 pt-2">
              <div className="h-5 w-5 bg-muted/60 rounded-full" />
              <div className="h-3 w-24 bg-muted/60 rounded" />
              <div className="h-3 w-16 bg-muted/60 rounded ml-4" />
              <div className="h-3 w-16 bg-muted/60 rounded" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FeedSkeleton;
