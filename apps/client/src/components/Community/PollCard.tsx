import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { votePoll } from '@/api/community';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  options: PollOption[];
  totalVotes: number;
  expiresAt?: string;
}

interface PollCardProps {
  postId: string;
  poll: Poll;
  onVoteSuccess?: (updatedPoll: Poll) => void;
  isLocked?: boolean;
  compact?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({
  postId,
  poll: initialPoll,
  onVoteSuccess,
  isLocked = false,
  compact = false,
}) => {
  const [poll, setPoll] = useState(initialPoll);
  const [voted, setVoted] = useState(false); // Local state to prevent multiple votes

  const voteMutation = useMutation({
    mutationFn: (optionIndex: number) => votePoll(postId, optionIndex),
    onSuccess: (data) => {
      const updatedPoll = data.data.data;
      setPoll(updatedPoll);
      setVoted(true);
      if (onVoteSuccess) onVoteSuccess(updatedPoll);
    },
  });

  const isExpired = poll.expiresAt ? new Date() > new Date(poll.expiresAt) : false;
  const isDisabled = isLocked || isExpired || voted || voteMutation.isPending;

  return (
    <div className={cn(
      "space-y-3 rounded-xl border border-border/60 bg-muted/30",
      compact ? "p-3 my-1" : "p-4 my-4"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">Poll</h4>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
          {poll.totalVotes} total votes
        </span>
      </div>

      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;

          return (
            <button
              key={index}
              onClick={() => !isDisabled && voteMutation.mutate(index)}
              disabled={isDisabled}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border border-border bg-card text-left transition-all",
                compact ? "p-2" : "p-3",
                !isDisabled && "hover:border-primary/50 hover:bg-card/80 active:scale-[0.98]",
                voted && "cursor-default"
              )}
            >
              {/* Progress bar background */}
              {(voted || isExpired) && (
                <div 
                  className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-3 text-sm">
                <span className="font-medium truncate">{option.text}</span>
                {(voted || isExpired) && (
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-bold text-primary">{percentage}%</span>
                    {voted && <Check className="h-3.5 w-3.5 text-primary" />}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isExpired && (
        <p className="text-[10px] text-center text-muted-foreground italic">
          This poll has ended.
        </p>
      )}
    </div>
  );
};
