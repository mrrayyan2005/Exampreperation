import axiosInstance from '@/api/axiosInstance';

const LEARNING_DOMAIN_API = '/learning-domain/holidays';

export interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: 'break' | 'holiday' | 'other';
  academicYearId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHolidayInput {
  name: string;
  date: string;
  type: 'break' | 'holiday' | 'other';
  academicYearId?: string;
}

export type UpdateHolidayInput = Partial<CreateHolidayInput>;

export const holidaysApi = {
  // Get all holidays
  getAll: async (): Promise<Holiday[]> => {
    const response = await axiosInstance.get(LEARNING_DOMAIN_API);
    return response.data;
  },

  // Get holidays in date range
  getByDateRange: async (startDate: string, endDate: string): Promise<Holiday[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get holiday by ID
  getById: async (id: string): Promise<Holiday> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/${id}`);
    return response.data;
  },

  // Create new holiday
  create: async (data: CreateHolidayInput): Promise<Holiday> => {
    const response = await axiosInstance.post(LEARNING_DOMAIN_API, data);
    return response.data;
  },

  // Update holiday
  update: async (id: string, data: UpdateHolidayInput): Promise<Holiday> => {
    const response = await axiosInstance.put(`${LEARNING_DOMAIN_API}/${id}`, data);
    return response.data;
  },

  // Delete holiday
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${LEARNING_DOMAIN_API}/${id}`);
  },
};