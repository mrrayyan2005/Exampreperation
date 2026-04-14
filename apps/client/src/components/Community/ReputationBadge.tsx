import React from 'react';
import { cn } from '@/lib/utils';
import { getReputationLevel } from '@/lib/reputation';
import { Trophy, Award, Medal, Shield } from 'lucide-react';

interface ReputationBadgeProps {
  karma: number;
  role?: 'member' | 'expert' | 'moderator' | 'owner';
  showLabel?: boolean;
  className?: string;
}

const LEVEL_ICONS: Record<number, React.ReactNode> = {
  1: null,
  2: <Award className="h-3 w-3" />,
  3: <Shield className="h-3 w-3" />,
  4: <Medal className="h-3 w-3" />,
  5: <Trophy className="h-3 w-3" />,
  6: <Trophy className="h-3.5 w-3.5 animate-pulse text-yellow-500" />,
};

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ 
  karma, 
  role,
  showLabel = true,
  className 
}) => {
  const level = getReputationLevel(karma);

  // Special UI for moderators or experts
  if (role === 'moderator' || role === 'owner') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/40 border border-red-200 dark:border-red-800",
        className
      )}>
        <Shield className="h-3 w-3" />
        <span>MOD</span>
      </div>
    );
  }

  if (role === 'expert') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800",
        className
      )}>
        <Award className="h-3 w-3" />
        <span>EXPERT</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
      level.color,
      className
    )}>
      {LEVEL_ICONS[level.level]}
      {showLabel && <span>{level.label}</span>}
      {!showLabel && <span>Lvl {level.level}</span>}
    </div>
  );
};
