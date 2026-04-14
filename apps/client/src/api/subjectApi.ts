
import axiosInstance from './axiosInstance';

export interface Subject {
    _id: string;
    name: string;
    color?: string;
    icon?: string;
    instructor?: string;
    code?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubjectRequest {
    name: string;
    color?: string;
    icon?: string;
    instructor?: string;
    code?: string;
    description?: string;
}

export const subjectApi = {
    createSubject: async (data: CreateSubjectRequest): Promise<Subject> => {
        const response = await axiosInstance.post('/subjects', data);
        console.log('createSubject - API Response:', response.data);
        return response.data?.data || response.data;
    },

    getSubjects: async (): Promise<Subject[]> => {
        try {
            const response = await axiosInstance.get('/subjects', {
                // Add timestamp to bust cache
                params: { _t: Date.now() }
            });
            
            console.log('Subjects API Response:', response.data);
            
            // API can return either:
            // 1. Direct array: []
            // 2. Wrapped: { success: true, data: [...] }
            let subjects: Subject[] = [];
            
            if (Array.isArray(response.data)) {
                subjects = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                subjects = response.data.data;
            }
            
            console.log('Successfully loaded subjects:', subjects);
            return subjects;
        } catch (error) {
            console.error('Error fetching subjects:', error);
            return [];
        }
    },

    getSubject: async (id: string): Promise<Subject> => {
        const response = await axiosInstance.get(`/subjects/${id}`);
        return response.data?.data || response.data;
    },

    updateSubject: async (id: string, data: Partial<CreateSubjectRequest>): Promise<Subject> => {
        const response = await axiosInstance.put(`/subjects/${id}`, data);
        return response.data?.data || response.data;
    },

    deleteSubject: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/subjects/${id}`);
    }
};
