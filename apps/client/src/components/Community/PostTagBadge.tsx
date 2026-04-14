import React from 'react';
import { cn } from '@/lib/utils';

const TAG_STYLES: Record<string, string> = {
  doubt: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  strategy: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  notes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  resources: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pyq: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'mock-test': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'current-affairs': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  formula: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  important: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  beginner: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  advanced: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
};

const DEFAULT_TAG_STYLE = 'bg-muted text-muted-foreground';

interface PostTagBadgeProps {
  tag: string;
  className?: string;
  onClick?: () => void;
}

export const PostTagBadge: React.FC<PostTagBadgeProps> = ({ tag, className, onClick }) => {
  const style = TAG_STYLES[tag] || DEFAULT_TAG_STYLE;
  return (
    <span
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-opacity',
        style,
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      #{tag}
    </span>
  );
};
