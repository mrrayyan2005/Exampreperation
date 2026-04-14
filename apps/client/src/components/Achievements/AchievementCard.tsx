import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../types/achievement';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Zap, Users, BookOpen, Star, Lock } from 'lucide-react';

interface AchievementCardProps {
    achievement: Achievement;
    index?: number;
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'study_time': return <Clock className="w-4 h-4" />;
        case 'consistency': return <Zap className="w-4 h-4" />;
        case 'social': return <Users className="w-4 h-4" />;
        case 'knowledge': return <BookOpen className="w-4 h-4" />;
        case 'milestone': return <Trophy className="w-4 h-4" />;
        default: return <Star className="w-4 h-4" />;
    }
};

const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case 'common': return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400';
        case 'uncommon': return 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400';
        case 'rare': return 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400';
        case 'epic': return 'border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-400';
        case 'legendary': return 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400';
        default: return 'border-slate-200 bg-slate-50 text-slate-600';
    }
};

const getRarityGlow = (rarity: string) => {
    switch (rarity) {
        case 'common': return 'shadow-none';
        case 'uncommon': return 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
        case 'rare': return 'shadow-[0_0_15px_rgba(59,130,246,0.15)]';
        case 'epic': return 'shadow-[0_0_20px_rgba(147,51,234,0.2)]';
        case 'legendary': return 'shadow-[0_0_25px_rgba(245,158,11,0.25)]';
        default: return '';
    }
};

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index = 0 }) => {
    const isUnlocked = achievement.userProgress?.isCompleted;
    const progress = achievement.userProgress?.progressPercentage || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={cn(
                "relative group overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]",
                getRarityColor(achievement.rarity),
                isUnlocked ? getRarityGlow(achievement.rarity) : "opacity-75 grayscale hover:grayscale-0 hover:opacity-100",
                !isUnlocked && "border-dashed"
            )}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg className="w-full h-full" width="100%" height="100%">
                    <pattern id={`pattern-${achievement._id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="currentColor" />
                    </pattern>
                    <rect width="100%" height="100%" fill={`url(#pattern-${achievement._id})`} />
                </svg>
            </div>

            <div className="relative z-10 flex items-start gap-4">
                {/* Icon Container */}
                <div className={cn(
                    "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                    isUnlocked ? "bg-white dark:bg-black/20" : "bg-slate-100 dark:bg-slate-800"
                )}>
                    {achievement.icon}
                    {isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white ring-2 ring-white dark:ring-black text-[10px]">
                            ✓
                        </div>
                    )}
                    {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 dark:bg-slate-900/50 rounded-xl backdrop-blur-[1px]">
                            <Lock className="w-6 h-6 text-slate-400" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold tracking-tight">{achievement.name}</h3>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                                    isUnlocked ? "bg-black/5 dark:bg-white/10" : "bg-slate-200 dark:bg-slate-800"
                                )}>
                                    {achievement.rarity}
                                </span>
                            </div>
                            <p className="text-sm opacity-90 mt-1">{achievement.description}</p>
                        </div>
                        {isUnlocked && (
                            <div className="flex flex-col items-end text-xs font-medium opacity-80">
                                <span className="flex items-center gap-1 text-amber-500">
                                    +{achievement.rewards.points} XP
                                </span>
                                {achievement.userProgress?.earnedAt && (
                                    <span className="text-[10px] opacity-60">
                                        {new Date(achievement.userProgress.earnedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-medium opacity-80">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-black/5 dark:bg-white/10" />
                        <div className="text-[10px] opacity-60 text-right">
                            {achievement.userProgress?.currentValue} / {achievement.userProgress?.targetValue} {achievement.criteria.timeframe === 'daily' ? 'today' : 'total'}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default AchievementCard;
