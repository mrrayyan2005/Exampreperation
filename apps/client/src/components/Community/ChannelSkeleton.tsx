import React from 'react';
import { cn } from '@/lib/utils';

export const ChannelSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-[1.5rem] border border-border/50 bg-white overflow-hidden h-[340px] flex flex-col animate-pulse shadow-sm"
        >
          {/* Header Accent */}
          <div className="h-2 bg-muted/40" />
          
          <div className="p-6 flex-1 space-y-6">
            {/* Avatar Unit */}
            <div className="flex justify-between items-start">
              <div className="h-14 w-14 rounded-2xl bg-muted/60" />
              <div className="space-y-1">
                <div className="h-3 bg-muted/40 rounded w-12" />
                <div className="h-2 bg-muted/20 rounded w-8 ml-auto" />
              </div>
            </div>

            {/* Title & Desc */}
            <div className="space-y-3">
              <div className="h-5 bg-muted/80 rounded-md w-5/6" />
              <div className="space-y-2">
                <div className="h-3 bg-muted/40 rounded w-full" />
                <div className="h-3 bg-muted/40 rounded w-4/6" />
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="flex justify-between items-center py-3 border-t border-border/20 mt-auto">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(j => <div key={j} className="h-6 w-6 rounded-full bg-muted/30 border-2 border-white" />)}
                </div>
                <div className="h-3 bg-muted/40 rounded w-10" />
              </div>
              <div className="h-3 bg-muted/20 rounded w-8" />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 bg-muted/60 rounded-xl" />
              <div className="h-10 bg-muted/60 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
