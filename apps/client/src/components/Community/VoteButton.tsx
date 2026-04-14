import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { castVote } from '@/api/community';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface VoteButtonProps {
  targetId: string;
  targetType: 'post' | 'comment';
  upvotes: number;
  downvotes: number;
  userVote: number; // 1, -1, or 0
  queryKey?: string[];
  className?: string;
  compact?: boolean;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  targetId,
  targetType,
  upvotes,
  downvotes,
  userVote,
  queryKey,
  className,
  compact = false,
}) => {
  const queryClient = useQueryClient();
  const [localVote, setLocalVote] = useState(userVote);
  const [localScore, setLocalScore] = useState(upvotes - downvotes);

  const voteMutation = useMutation({
    mutationFn: (value: 1 | -1) => castVote({ targetId, targetType, value }),
    onMutate: async (value: 1 | -1) => {
      // Optimistic update
      const newVote = localVote === value ? 0 : value;
      const diff = newVote - localVote;
      setLocalVote(newVote);
      setLocalScore((prev) => prev + diff);
    },
    onSuccess: (data) => {
      const { upvotes: newUp, downvotes: newDown, score, userVote: newVote } = data.data.data;
      setLocalScore(score);
      setLocalVote(newVote);
      if (queryKey) queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      // Rollback on error
      setLocalVote(userVote);
      setLocalScore(upvotes - downvotes);
    },
  });

  const scoreColor =
    localScore > 0
      ? 'text-orange-500'
      : localScore < 0
      ? 'text-blue-400'
      : 'text-muted-foreground';

  return (
    <div className={cn('flex items-center', compact ? 'gap-1' : 'flex-col gap-0.5', className)}>
      <button
        aria-label="Upvote"
        onClick={() => !voteMutation.isPending && voteMutation.mutate(1)}
        disabled={voteMutation.isPending}
        className={cn(
          'rounded p-1 transition-all duration-150 hover:bg-orange-100 dark:hover:bg-orange-900/30',
          localVote === 1
            ? 'text-orange-500 scale-110'
            : 'text-muted-foreground hover:text-orange-500'
        )}
      >
        <ArrowUp className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>

      <span
        className={cn(
          'font-bold tabular-nums transition-colors duration-200',
          compact ? 'text-sm min-w-[24px] text-center' : 'text-base min-w-[32px] text-center',
          scoreColor
        )}
      >
        {localScore > 999 ? `${(localScore / 1000).toFixed(1)}k` : localScore}
      </span>

      <button
        aria-label="Downvote"
        onClick={() => !voteMutation.isPending && voteMutation.mutate(-1)}
        disabled={voteMutation.isPending}
        className={cn(
          'rounded p-1 transition-all duration-150 hover:bg-blue-100 dark:hover:bg-blue-900/30',
          localVote === -1
            ? 'text-blue-400 scale-110'
            : 'text-muted-foreground hover:text-blue-400'
        )}
      >
        <ArrowDown className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>
    </div>
  );
};
