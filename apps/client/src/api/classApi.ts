
import axiosInstance from './axiosInstance';
import { Subject } from './subjectApi';

export interface ClassSession {
    _id: string;
    subject: Subject | string; // Populated or ID
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    startTime: string;
    endTime: string;
    location?: string;
    room?: string;
    teacher?: string;
    type?: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar' | 'Other';
    date?: string;
    isRecurring: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClassRequest {
    subject: string; // ID
    day?: string;
    startTime: string;
    endTime: string;
    location?: string;
    room?: string;
    teacher?: string;
    type?: string;
    date?: string;
    isRecurring: boolean;
    notes?: string;
}

export const classApi = {
    createClass: async (data: CreateClassRequest): Promise<ClassSession> => {
        const response = await axiosInstance.post('/classes', data);
        return response.data.data;
    },

    getClasses: async (params?: { day?: string; isRecurring?: boolean }): Promise<ClassSession[]> => {
        const response = await axiosInstance.get('/classes', { params });
        return response.data.data;
    },

    getClass: async (id: string): Promise<ClassSession> => {
        const response = await axiosInstance.get(`/classes/${id}`);
        return response.data.data;
    },

    updateClass: async (id: string, data: Partial<CreateClassRequest>): Promise<ClassSession> => {
        const response = await axiosInstance.put(`/classes/${id}`, data);
        return response.data.data;
    },

    deleteClass: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/classes/${id}`);
    }
};
