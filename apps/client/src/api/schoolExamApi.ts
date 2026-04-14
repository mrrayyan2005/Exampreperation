
import axiosInstance from './axiosInstance';
import { Subject } from './subjectApi';

export interface SchoolExam {
    _id: string;
    subject: Subject | string;
    title?: string;
    date: string;
    startTime: string;
    duration: number;
    location?: string;
    seat?: string;
    module?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSchoolExamRequest {
    subject: string;
    title?: string;
    date: string;
    startTime: string;
    duration?: number;
    location?: string;
    seat?: string;
    module?: string;
    notes?: string;
}

export const schoolExamApi = {
    createExam: async (data: CreateSchoolExamRequest): Promise<SchoolExam> => {
        const response = await axiosInstance.post('/school-exams', data);
        return response.data.data;
    },

    getExams: async (params?: {
        subject?: string;
        date?: string;
        startDate?: string;
        endDate?: string
    }): Promise<SchoolExam[]> => {
        const response = await axiosInstance.get('/school-exams', { params });
        return response.data.data;
    },

    getExam: async (id: string): Promise<SchoolExam> => {
        const response = await axiosInstance.get(`/school-exams/${id}`);
        return response.data.data;
    },

    updateExam: async (id: string, data: Partial<CreateSchoolExamRequest>): Promise<SchoolExam> => {
        const response = await axiosInstance.put(`/school-exams/${id}`, data);
        return response.data.data;
    },

    deleteExam: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/school-exams/${id}`);
    }
};
