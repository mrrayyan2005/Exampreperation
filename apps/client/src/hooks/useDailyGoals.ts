import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { toast } from 'sonner';

export interface DailyGoal {
    id: string;
    task: string;
    completed: boolean;
    date: string;
    createdAt: string;
    _id?: string;
    user?: string;
    title?: string;
    description?: string;
    tasks?: any[];
    targetHours?: number;
    actualHours?: number;
    updatedAt?: string;
}

export interface GoalHistoryItem {
    task: string;
    frequency: number;
    lastUsed: string;
}

const fetchDailyGoals = async (date: string) => {
    const response = await axiosInstance.get(`/daily-goals?date=${date}`);
    // Handle different API response formats and map _id to id
    const data = response.data;
    const goalsData = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
            ? data.data
            : [];

    return goalsData.map((goal: any) => ({
        ...goal,
        id: goal._id || goal.id
    }));
};

const fetchGoalHistory = async (): Promise<GoalHistoryItem[]> => {
    const response = await axiosInstance.get('/daily-goals/history');
    const data = response.data;
    return Array.isArray(data)
        ? data
        : Array.isArray(data.data)
            ? data.data
            : [];
};

export function useDailyGoals(date: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['dailyGoals', date],
        queryFn: () => fetchDailyGoals(date),
        enabled: !!date,
    });

    const historyQuery = useQuery({
        queryKey: ['dailyGoalsHistory'],
        queryFn: fetchGoalHistory,
    });

    const addGoalMutation = useMutation({
        mutationFn: async (goalData: { task: string; date: string }) => {
            const response = await axiosInstance.post('/daily-goals', goalData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyGoals', date] });
            toast.success('Goal added successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add goal');
        },
    });

    const toggleGoalMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await axiosInstance.patch(`/daily-goals/${id}/toggle`);
            return response.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['dailyGoals', date] });

            // Handle new achievements
            if (data.newAchievements && data.newAchievements.length > 0) {
                data.newAchievements.forEach((achievement: any) => {
                    setTimeout(() => {
                        toast.success(`🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}`, {
                            description: `${achievement.icon} ${achievement.description}`,
                            duration: 5000,
                        });
                    }, 500);
                });
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to toggle goal');
        },
    });

    const deleteGoalMutation = useMutation({
        mutationFn: async (id: string) => {
            await axiosInstance.delete(`/daily-goals/${id}`);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyGoals', date] });
            toast.success('Goal deleted');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete goal');
        },
    });

    return {
        ...query,
        goals: query.data || [],
        addGoal: addGoalMutation.mutate,
        toggleGoal: toggleGoalMutation.mutate,
        deleteGoal: deleteGoalMutation.mutate,
        isAdding: addGoalMutation.isPending,
        isToggling: toggleGoalMutation.isPending,
        isDeleting: deleteGoalMutation.isPending,
        pastGoals: historyQuery.data || [],
        isLoadingHistory: historyQuery.isLoading,
    };
}
