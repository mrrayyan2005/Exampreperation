import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchLeaderboard } from '@/api/communityPhase2';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { Crown, Star, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

const RANK_ICONS = [
  <Crown className="h-4 w-4 text-yellow-500" />,
  <Medal className="h-4 w-4 text-slate-400" />,
  <Medal className="h-4 w-4 text-amber-600" />,
];

interface KarmaLeaderboardProps {
  channelSlug?: string;
}

export const KarmaLeaderboard: React.FC<KarmaLeaderboardProps> = ({ channelSlug }) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = channelSlug || paramSlug || '';

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', slug],
    queryFn: () => fetchLeaderboard(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const leaders: any[] = data || [];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-3.5 w-3.5 text-yellow-500" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Top Contributors
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="h-7 w-7 rounded-full bg-muted" />
              <div className="flex-1 h-3 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2 text-center">
          No contributors yet — start posting!
        </p>
      ) : (
        <div className="space-y-1.5">
          {leaders.slice(0, 5).map((entry: any, idx: number) => (
            <div
              key={entry.user?._id || idx}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                idx === 0 && 'bg-yellow-50/60 dark:bg-yellow-900/10'
              )}
            >
              {/* Rank */}
              <div className="w-5 flex-shrink-0 flex items-center justify-center">
                {RANK_ICONS[idx] ?? (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <SmartAvatar
                src={entry.user?.profilePicture}
                email={entry.user?.email}
                name={entry.user?.name}
                size="sm"
                className="h-6 w-6 flex-shrink-0"
              />

              {/* Name */}
              <span className="flex-1 text-xs font-medium truncate">
                {entry.user?.name || 'Unknown'}
              </span>

              {/* Karma */}
              <span
                className={cn(
                  'text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full',
                  idx === 0
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {entry.karma.toLocaleString()} ✦
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
