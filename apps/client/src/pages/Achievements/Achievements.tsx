import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { achievementApi } from '@/api/achievementApi';
import AchievementCard from '@/components/Achievements/AchievementCard';
import { Achievement } from '@/types/achievement';
import { Trophy, Medal, Star, Flame, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StatsCard = ({ icon, label, value, subtext, color }: any) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
    >
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color} bg-opacity-10 text-xl font-bold`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</div>
            {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
        </div>
    </motion.div>
);

const Achievements = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['achievements'],
        queryFn: achievementApi.getMyProgress
    });

    const [filter, setFilter] = useState('all');

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-red-500">
                Failed to load achievements. Please try again later.
            </div>
        );
    }

    const achievements = data?.data || [];
    const stats = data?.stats;

    const unlockedAchievements = achievements.filter(a => a.userProgress?.isCompleted);
    const inProgressAchievements = achievements.filter(a => !a.userProgress?.isCompleted && (a.userProgress?.progressPercentage || 0) > 0);
    const lockedAchievements = achievements.filter(a => !a.userProgress?.isCompleted && (a.userProgress?.progressPercentage || 0) === 0);

    const filteredAchievements = () => {
        switch (filter) {
            case 'unlocked': return unlockedAchievements;
            case 'inprogress': return inProgressAchievements;
            case 'locked': return lockedAchievements;
            default: return achievements;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Achievements & Badges
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
                    Track your progress and earn rewards as you master your studies.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    icon={<Trophy className="text-yellow-500" />}
                    color="bg-yellow-500 text-yellow-500"
                    label="Total Earned"
                    value={stats?.completedCount || 0}
                    subtext={`Out of ${stats?.totalCount || 0} badges`}
                />
                <StatsCard
                    icon={<Star className="text-indigo-500" />}
                    color="bg-indigo-500 text-indigo-500"
                    label="Total XP"
                    value={stats?.totalPoints || 0}
                    subtext="Keep learning to earn more!"
                />
                <StatsCard
                    icon={<Medal className="text-emerald-500" />}
                    color="bg-emerald-500 text-emerald-500"
                    label="Completion Rate"
                    value={`${Math.round(((stats?.completedCount || 0) / (stats?.totalCount || 1)) * 100)}%`}
                    subtext="You're doing great!"
                />
                <StatsCard
                    icon={<Flame className="text-orange-500" />}
                    color="bg-orange-500 text-orange-500"
                    label="Current Streak"
                    value="User Streak" // TODO: Fetch real streak
                    subtext="Days in a row"
                />
            </div>

            {/* Main Content */}
            <Tabs defaultValue="all" className="space-y-6" onValueChange={setFilter}>
                <div className="flex items-center justify-between">
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <TabsTrigger value="all" className="px-4 py-2 rounded-md transition-all">All Badges</TabsTrigger>
                        <TabsTrigger value="unlocked" className="px-4 py-2 rounded-md transition-all">Unlocked ({unlockedAchievements.length})</TabsTrigger>
                        <TabsTrigger value="inprogress" className="px-4 py-2 rounded-md transition-all">In Progress ({inProgressAchievements.length})</TabsTrigger>
                    </TabsList>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={filter}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredAchievements().map((achievement, index) => (
                            <AchievementCard key={achievement._id} achievement={achievement} index={index} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredAchievements().length === 0 && (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No achievements found in this category.</p>
                    </div>
                )}
            </Tabs>
        </div>
    );
};

export default Achievements;
