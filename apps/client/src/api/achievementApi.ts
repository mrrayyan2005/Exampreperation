import axiosInstance from './axiosInstance';
import { AchievementResponse } from '../types/achievement';

export const achievementApi = {
    getAchievements: async (): Promise<AchievementResponse> => {
        const response = await axiosInstance.get('/achievements');
        return response.data;
    },

    getMyProgress: async (): Promise<AchievementResponse> => {
        const response = await axiosInstance.get('/achievements/my-progress');
        return response.data;
    },

    getLeaderboard: async (achievementId: string) => {
        const response = await axiosInstance.get(`/achievements/${achievementId}/leaderboard`);
        return response.data;
    }
};
