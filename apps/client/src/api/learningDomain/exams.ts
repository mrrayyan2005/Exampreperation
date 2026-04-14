import axiosInstance from '@/api/axiosInstance';

const LEARNING_DOMAIN_API = '/learning-domain/exams';

export interface Exam {
  _id: string;
  title: string;
  subjectId: string;
  subject?: { name: string; color: string };
  examDate: string;
  duration: number;
  location?: string;
  totalMarks?: number;
  passingMarks?: number;
  status: 'upcoming' | 'scheduled' | 'completed' | 'cancelled';
  result?: {
    marksObtained?: number;
    percentage?: number;
    grade?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamInput {
  title: string;
  subjectId: string;
  examDate: string;
  duration: number;
  location?: string;
  totalMarks?: number;
  passingMarks?: number;
}

export type UpdateExamInput = Partial<CreateExamInput>;

export const examsApi = {
  // Get all exams
  getAll: async (): Promise<Exam[]> => {
    const response = await axiosInstance.get(LEARNING_DOMAIN_API);
    return response.data;
  },

  // Get upcoming exams
  getUpcoming: async (limit: number = 10): Promise<Exam[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/upcoming?limit=${limit}`);
    return response.data;
  },

  // Get exams by subject
  getBySubject: async (subjectId: string): Promise<Exam[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/subject/${subjectId}`);
    return response.data;
  },

  // Get exam by ID
  getById: async (id: string): Promise<Exam> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/${id}`);
    return response.data;
  },

  // Create new exam
  create: async (data: CreateExamInput): Promise<Exam> => {
    const response = await axiosInstance.post(LEARNING_DOMAIN_API, data);
    return response.data;
  },

  // Update exam
  update: async (id: string, data: UpdateExamInput): Promise<Exam> => {
    const response = await axiosInstance.put(`${LEARNING_DOMAIN_API}/${id}`, data);
    return response.data;
  },

  // Delete exam
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${LEARNING_DOMAIN_API}/${id}`);
  },

  // Add exam result
  addResult: async (id: string, result: { marksObtained?: number; percentage?: number; grade?: string }): Promise<Exam> => {
    const response = await axiosInstance.patch(`${LEARNING_DOMAIN_API}/${id}/result`, result);
    return response.data;
  },
};