export interface Achievement {
    _id: string;
    name: string;
    description: string;
    category: 'study_time' | 'consistency' | 'collaboration' | 'knowledge' | 'social' | 'milestone' | 'challenge' | 'special';
    type: 'badge' | 'title' | 'reward' | 'points';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    icon: string;
    color: string;
    criteria: {
        triggerType: string;
        targetValue: number;
        timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
    };
    rewards: {
        points: number;
        title?: string;
        badge?: {
            name: string;
            icon: string;
            color: string;
        };
    };
    userProgress?: {
        currentValue: number;
        targetValue: number;
        isCompleted: boolean;
        earnedAt: string | null;
        progressPercentage: number;
    };
}

export interface AchievementStats {
    totalPoints: number;
    completedCount: number;
    totalCount: number;
}

export interface AchievementResponse {
    success: boolean;
    data: Achievement[];
    stats: AchievementStats;
}
