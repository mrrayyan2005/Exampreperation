import axiosInstance from './axiosInstance';

export interface Question {
    _id: string;
    text: string;
    options: {
        _id: string;
        text: string;
    }[];
    // Correct option not sent to frontend for tests
    topic: string;
}

export interface Test {
    _id: string;
    title: string;
    type: 'MOCK' | 'PRACTICE' | 'SECTIONAL' | 'PYQ';
    duration: number; // minutes
    totalMarks: number;
    questions: Question[];
    questionsCount?: number;
    createdAt: string;
}

export interface TestAttempt {
    _id: string;
    test: string;
    score: number;
    maxScore: number;
    accuracy: number;
    status: 'COMPLETED' | 'IN_PROGRESS';
    createdAt: string;
}

const testApi = {
    // Currently createTest would be for admins/teachers, but we can expose for now or just have a mock one
    createTest: async (data: Partial<Test>) => {
        const response = await axiosInstance.post('/tests', data);
        return response.data.data;
    },

    getTests: async (filters?: { type?: string; subject?: string; page?: number; limit?: number }) => {
        const response = await axiosInstance.get('/tests', { params: filters });
        return response.data.data;
    },

    getTest: async (id: string) => {
        const response = await axiosInstance.get(`/tests/${id}`);
        return response.data.data;
    },

    submitAttempt: async (testId: string, answers: { questionId: string; selectedOption: string; timeSpent: number }[]) => {
        const response = await axiosInstance.post(`/tests/${testId}/submit`, { answers });
        return response.data.data;
    },

    getMyAttempts: async () => {
        const response = await axiosInstance.get('/tests/attempts/me');
        return response.data.data;
    },

    getNextAdaptiveQuestion: async (testId: string, previousAnswers: any[], lastAnswer: any = null) => {
        const response = await axiosInstance.post(`/tests/${testId}/adaptive/next-question`, { previousAnswers, lastAnswer });
        return response.data.data;
    },

    submitAdaptiveAttempt: async (testId: string, answers: any[]) => {
        const response = await axiosInstance.post(`/tests/${testId}/adaptive/submit`, { answers });
        return response.data.data;
    }
};

export default testApi;
