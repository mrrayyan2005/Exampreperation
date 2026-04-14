import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';
import { MonthlyPlanFormData } from '@/lib/formSchemas';

export interface MonthlyPlan {
  id: string;
  subject: string;
  target: string;
  deadline: string;
  completed: boolean;
  createdAt: string;
  // New fields from backend
  targetType: 'pages' | 'chapters' | 'topics' | 'hours';
  targetAmount: number;
  completedAmount: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Paused';
  progressPercentage: number;
  description?: string;
}

interface MonthlyPlanState {
  plans: MonthlyPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MonthlyPlanState = {
  plans: [],
  isLoading: false,
  error: null,
};

// Backend plan interface
interface BackendMonthlyPlan {
  _id: string;
  subject: string;
  targetType: 'pages' | 'chapters' | 'topics' | 'hours';
  targetAmount: number;
  completedAmount: number;
  deadline: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Paused';
  createdAt: string;
  progressPercentage: number;
}

// Transform backend plan to frontend format
const transformBackendPlan = (backendPlan: BackendMonthlyPlan): MonthlyPlan => ({
  id: backendPlan._id,
  subject: backendPlan.subject,
  target: backendPlan.description || '',
  deadline: backendPlan.deadline,
  completed: backendPlan.status === 'Completed',
  createdAt: backendPlan.createdAt,
  targetType: backendPlan.targetType,
  targetAmount: backendPlan.targetAmount,
  completedAmount: backendPlan.completedAmount,
  priority: backendPlan.priority,
  status: backendPlan.status,
  progressPercentage: backendPlan.progressPercentage || Math.round((backendPlan.completedAmount / backendPlan.targetAmount) * 100),
  description: backendPlan.description
});

export const fetchMonthlyPlans = createAsyncThunk(
  'monthlyPlans/fetchMonthlyPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/monthly-plans');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch monthly plans';
      return rejectWithValue(errorMessage);
    }
  }
);

export const addMonthlyPlan = createAsyncThunk(
  'monthlyPlans/addMonthlyPlan',
  async (planData: MonthlyPlanFormData, { rejectWithValue }) => {
    try {
      if (!planData.deadline) {
        return rejectWithValue('Deadline is required');
      }

      const deadlineDate = new Date(planData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        return rejectWithValue('Invalid deadline date');
      }

      const backendData = {
        month: deadlineDate.getMonth() + 1,
        year: deadlineDate.getFullYear(),
        subject: planData.subject,
        targetType: planData.targetType,
        targetAmount: planData.targetAmount,
        deadline: planData.deadline,
        description: planData.target,
        priority: planData.priority
      };

      console.log('Pushing to backend:', backendData);

      const response = await axiosInstance.post('/monthly-plans', backendData);
      return response.data;
    } catch (error: any) {
      console.error('Add plan thunk error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add plan';
      // If it's a 500, we might want to say it's a temporary issue or check for duplicates
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateMonthlyPlan = createAsyncThunk(
  'monthlyPlans/updateMonthlyPlan',
  async ({ id, data }: { id: string; data: Partial<MonthlyPlan> }, { rejectWithValue }) => {
    try {
      // Transform data for backend
      const backendData: Record<string, unknown> = {};
      if (data.completed !== undefined) {
        backendData.status = data.completed ? 'Completed' : 'Not Started';
      }
      if (data.subject) backendData.subject = data.subject;
      if (data.target) backendData.description = data.target;
      if (data.deadline) backendData.deadline = data.deadline;
      if (data.targetType) backendData.targetType = data.targetType;
      if (data.targetAmount) backendData.targetAmount = data.targetAmount;
      if (data.completedAmount !== undefined) backendData.completedAmount = data.completedAmount;
      if (data.priority) backendData.priority = data.priority;
      if (data.status) backendData.status = data.status;
      
      const response = await axiosInstance.put(`/monthly-plans/${id}`, backendData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update plan';
      return rejectWithValue(errorMessage);
    }
  }
);

// New thunk for updating progress only
export const updateMonthlyPlanProgress = createAsyncThunk(
  'monthlyPlans/updateProgress',
  async ({ id, completedAmount }: { id: string; completedAmount: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/monthly-plans/${id}/progress`, { completedAmount });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update progress';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteMonthlyPlan = createAsyncThunk(
  'monthlyPlans/deleteMonthlyPlan',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/monthly-plans/${id}`);
      return id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete plan';
      return rejectWithValue(errorMessage);
    }
  }
);

const monthlyPlanSlice = createSlice({
  name: 'monthlyPlans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyPlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMonthlyPlans.fulfilled, (state, action: PayloadAction<{ data: BackendMonthlyPlan[] }>) => {
        state.isLoading = false;
        // Transform backend data to frontend format
        const backendPlans = action.payload.data || [];
        state.plans = backendPlans.map((plan: BackendMonthlyPlan) => transformBackendPlan(plan));
      })
      .addCase(fetchMonthlyPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addMonthlyPlan.fulfilled, (state, action: PayloadAction<{ data: BackendMonthlyPlan }>) => {
        const backendPlan = action.payload.data;
        const frontendPlan = transformBackendPlan(backendPlan);
        state.plans.push(frontendPlan);
      })
      .addCase(updateMonthlyPlan.fulfilled, (state, action: PayloadAction<{ data: BackendMonthlyPlan }>) => {
        const backendPlan = action.payload.data;
        const frontendPlan = transformBackendPlan(backendPlan);
        const index = state.plans.findIndex((plan) => plan.id === frontendPlan.id);
        if (index !== -1) {
          state.plans[index] = frontendPlan;
        }
      })
      .addCase(updateMonthlyPlanProgress.fulfilled, (state, action: PayloadAction<{ data: BackendMonthlyPlan }>) => {
        const backendPlan = action.payload.data;
        const frontendPlan = transformBackendPlan(backendPlan);
        const index = state.plans.findIndex((plan) => plan.id === frontendPlan.id);
        if (index !== -1) {
          state.plans[index] = frontendPlan;
        }
      })
      .addCase(deleteMonthlyPlan.fulfilled, (state, action: PayloadAction<string>) => {
        state.plans = state.plans.filter((plan) => plan.id !== action.payload);
      });
  },
});

export const { clearError } = monthlyPlanSlice.actions;
export default monthlyPlanSlice.reducer;
