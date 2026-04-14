
import axiosInstance from './axiosInstance';
import { Subject } from './subjectApi';

export interface SchoolTask {
    _id: string;
    subject?: Subject | string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    type: 'Homework' | 'Assignment' | 'Project' | 'Revision' | 'Preparation' | 'Other';
    priority: 'Low' | 'Medium' | 'High';
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSchoolTaskRequest {
    subject?: string;
    title: string;
    description?: string;
    dueDate: string;
    status?: string;
    type?: string;
    priority?: string;
}

export const schoolTaskApi = {
    createTask: async (data: CreateSchoolTaskRequest): Promise<SchoolTask> => {
        const response = await axiosInstance.post('/school-tasks', data);
        return response.data.data;
    },

    getTasks: async (params?: {
        status?: string;
        subject?: string;
        type?: string;
        dueDate?: string
    }): Promise<SchoolTask[]> => {
        const response = await axiosInstance.get('/school-tasks', { params });
        return response.data.data;
    },

    getTask: async (id: string): Promise<SchoolTask> => {
        const response = await axiosInstance.get(`/school-tasks/${id}`);
        return response.data.data;
    },

    updateTask: async (id: string, data: Partial<CreateSchoolTaskRequest>): Promise<SchoolTask> => {
        const response = await axiosInstance.put(`/school-tasks/${id}`, data);
        return response.data.data;
    },

    deleteTask: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/school-tasks/${id}`);
    }
};
