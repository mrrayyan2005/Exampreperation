import axiosInstance from '@/api/axiosInstance';

const LEARNING_DOMAIN_API = '/learning-domain/subjects';

export interface Subject {
  _id: string;
  name: string;
  code?: string;
  color: string;
  icon?: string;
  instructor?: string;
  description?: string;
  credits?: number;
  academicYearId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectInput {
  name: string;
  code?: string;
  color: string;
  icon?: string;
  instructor?: string;
  description?: string;
  credits?: number;
  academicYearId?: string;
}

export type UpdateSubjectInput = Partial<CreateSubjectInput>;

export const subjectsApi = {
  // Get all subjects
  getAll: async (): Promise<Subject[]> => {
    const response = await axiosInstance.get(LEARNING_DOMAIN_API);
    return response.data;
  },

  // Get subjects by academic year
  getByAcademicYear: async (academicYearId: string): Promise<Subject[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}?academicYearId=${academicYearId}`);
    return response.data;
  },

  // Get subject by ID
  getById: async (id: string): Promise<Subject> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/${id}`);
    return response.data;
  },

  // Create new subject
  create: async (data: CreateSubjectInput): Promise<Subject> => {
    const response = await axiosInstance.post(LEARNING_DOMAIN_API, data);
    return response.data;
  },

  // Update subject
  update: async (id: string, data: UpdateSubjectInput): Promise<Subject> => {
    const response = await axiosInstance.put(`${LEARNING_DOMAIN_API}/${id}`, data);
    return response.data;
  },

  // Delete subject
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${LEARNING_DOMAIN_API}/${id}`);
  },
};