import axiosInstance from '@/api/axiosInstance';

const LEARNING_DOMAIN_API = '/learning-domain/academic-years';

export interface AcademicYear {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
}

export type UpdateAcademicYearInput = Partial<CreateAcademicYearInput>;

export const academicYearsApi = {
  // Get all academic years
  getAll: async (): Promise<AcademicYear[]> => {
    const response = await axiosInstance.get(LEARNING_DOMAIN_API);
    return response.data;
  },

  // Get current active academic year
  getCurrent: async (): Promise<AcademicYear> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/current`);
    return response.data;
  },

  // Get academic year by ID
  getById: async (id: string): Promise<AcademicYear> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/${id}`);
    return response.data;
  },

  // Create new academic year
  create: async (data: CreateAcademicYearInput): Promise<AcademicYear> => {
    const response = await axiosInstance.post(LEARNING_DOMAIN_API, data);
    return response.data;
  },

  // Update academic year
  update: async (id: string, data: UpdateAcademicYearInput): Promise<AcademicYear> => {
    const response = await axiosInstance.put(`${LEARNING_DOMAIN_API}/${id}`, data);
    return response.data;
  },

  // Delete academic year
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${LEARNING_DOMAIN_API}/${id}`);
  },

  // Set as default academic year
  setAsDefault: async (id: string): Promise<AcademicYear> => {
    const response = await axiosInstance.patch(`${LEARNING_DOMAIN_API}/${id}/default`, {});
    return response.data;
  },
};