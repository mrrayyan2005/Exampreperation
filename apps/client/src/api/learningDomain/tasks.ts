import axiosInstance from '@/api/axiosInstance';

const LEARNING_DOMAIN_API = '/learning-domain/tasks';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  subjectId?: string;
  subject?: { name: string; color: string };
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  subjectId?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
}

export const tasksApi = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    const response = await axiosInstance.get(LEARNING_DOMAIN_API);
    return response.data;
  },

  // Get pending tasks
  getPending: async (): Promise<Task[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/pending`);
    return response.data;
  },

  // Get today's tasks
  getToday: async (): Promise<Task[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/today`);
    return response.data;
  },

  // Get overdue tasks
  getOverdue: async (): Promise<Task[]> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/overdue`);
    return response.data;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await axiosInstance.get(`${LEARNING_DOMAIN_API}/${id}`);
    return response.data;
  },

  // Create new task
  create: async (data: CreateTaskInput): Promise<Task> => {
    const response = await axiosInstance.post(LEARNING_DOMAIN_API, data);
    return response.data;
  },

  // Update task
  update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await axiosInstance.put(`${LEARNING_DOMAIN_API}/${id}`, data);
    return response.data;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${LEARNING_DOMAIN_API}/${id}`);
  },

  // Mark task as complete
  markAsComplete: async (id: string): Promise<Task> => {
    const response = await axiosInstance.patch(`${LEARNING_DOMAIN_API}/${id}/complete`, {});
    return response.data;
  },
};