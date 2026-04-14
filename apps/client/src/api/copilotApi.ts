import axiosInstance from './axiosInstance';

export interface CopilotMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    actionsTaken?: Array<{
        tool: string;
        description: string;
        result: any;
    }>;
    timestamp: Date;
}

export interface ProactiveSuggestion {
    type: 'urgent' | 'nudge' | 'tip' | 'achievement';
    title: string;
    description: string;
    action?: {
        label: string;
        prompt: string;
    };
}

export interface DailyBriefing {
    greeting: string;
    todaySummary: string;
    priorities: string[];
    studyPlan: string;
}

export const copilotApi = {
    chat: async (message: string, conversationId?: string) => {
        const response = await axiosInstance.post('/copilot/chat', {
            message,
            conversationId,
        });
        return response.data.data;
    },

    getSuggestions: async (): Promise<ProactiveSuggestion[]> => {
        const response = await axiosInstance.get('/copilot/suggestions');
        return response.data.data;
    },

    getDailyBriefing: async (): Promise<DailyBriefing> => {
        const response = await axiosInstance.get('/copilot/daily-briefing');
        return response.data.data;
    },
};
