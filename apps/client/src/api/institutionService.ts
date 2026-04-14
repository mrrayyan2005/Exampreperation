import axiosInstance from './axiosInstance';

export interface BulkUploadResponse {
    success: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
}

export const institutionService = {
    bulkUploadStudents: async (file: File): Promise<BulkUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/institutions/students/bulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    getStats: async () => {
        const response = await axiosInstance.get('/institutions/me');
        return response.data.data;
    },

    getStudents: async () => {
        const response = await axiosInstance.get('/institutions/students');
        return response.data;
    }
};
