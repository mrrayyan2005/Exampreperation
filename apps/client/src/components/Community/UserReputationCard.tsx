import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getReputationLevel, REPUTATION_LEVELS } from '@/lib/reputation';
import { Award, Zap, TrendingUp, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserReputationCardProps {
  user: {
    name: string;
    progressStats?: {
      karma: number;
      postsCount: number;
      bestAnswersCount: number;
    }
  };
  className?: string;
}

export const UserReputationCard: React.FC<UserReputationCardProps> = ({ user, className }) => {
  const karma = user.progressStats?.karma || 0;
  const currentLevel = getReputationLevel(karma);
  
  // Find next level
  const nextLevel = REPUTATION_LEVELS.find(l => l.minKarma > karma) || null;
  
  const progress = nextLevel 
    ? ((karma - currentLevel.minKarma) / (nextLevel.minKarma - currentLevel.minKarma)) * 100
    : 100;

  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm bg-gradient-to-br from-card to-muted/30", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Your Reputation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Level */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rank</p>
            <p className={cn("text-lg font-bold", currentLevel.color.split(' ')[0])}>
              {currentLevel.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Karma</p>
            <p className="text-lg font-bold text-foreground">{karma.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
              <span>Next: {nextLevel.label}</span>
              <span>{Math.round(nextLevel.minKarma - karma)} more karma</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-lg bg-background/50 border border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Zap className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Posts</span>
            </div>
            <p className="text-sm font-bold">{user.progressStats?.postsCount || 0}</p>
          </div>
          <div className="p-2 rounded-lg bg-background/50 border border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <MessageSquare className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Doubts Solved</span>
            </div>
            <p className="text-sm font-bold">{user.progressStats?.bestAnswersCount || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
