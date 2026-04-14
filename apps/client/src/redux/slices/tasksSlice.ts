import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksApi, Task } from '@/api/learningDomain/tasks';
import type { CreateTaskInput, UpdateTaskInput } from '@/api/learningDomain/tasks';

interface TasksState {
  allTasks: Task[];
  pendingTasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'pending' | 'today' | 'overdue';
}

const initialState: TasksState = {
  allTasks: [],
  pendingTasks: [],
  todayTasks: [],
  overdueTasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,
  filter: 'all',
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await tasksApi.getAll();
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchPendingTasks = createAsyncThunk(
  'tasks/fetchPendingTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await tasksApi.getPending();
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending tasks');
    }
  }
);

export const fetchTodayTasks = createAsyncThunk(
  'tasks/fetchTodayTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = tasksApi.getToday();
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s tasks');
    }
  }
);

export const fetchOverdueTasks = createAsyncThunk(
  'tasks/fetchOverdueTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = tasksApi.getOverdue();
      return tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const task = await tasksApi.getById(id);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: CreateTaskInput, { rejectWithValue }) => {
    try {
      const task = await tasksApi.create(data);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskInput }, { rejectWithValue }) => {
    try {
      const task = await tasksApi.update(id, data);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const markTaskAsComplete = createAsyncThunk(
  'tasks/markTaskAsComplete',
  async (id: string, { rejectWithValue }) => {
    try {
      const task = await tasksApi.markAsComplete(id);
      return task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark task as complete');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<'all' | 'pending' | 'today' | 'overdue'>) => {
      state.filter = action.payload;
    },
    selectTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    // Optimistic updates
    updateTaskStatusOptimistic: (state, action: PayloadAction<{ id: string; status: Task['status'] }>) => {
      const { id, status } = action.payload;
      const updateTasks = (tasks: Task[]) => {
        return tasks.map(task => 
          task._id === id ? { ...task, status } : task
        );
      };
      state.allTasks = updateTasks(state.allTasks);
      state.pendingTasks = updateTasks(state.pendingTasks);
      state.todayTasks = updateTasks(state.todayTasks);
      state.overdueTasks = updateTasks(state.overdueTasks);
      if (state.selectedTask?._id === id) {
        state.selectedTask.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingTasks.fulfilled, (state, action) => {
        state.pendingTasks = action.payload;
      })
      .addCase(fetchTodayTasks.fulfilled, (state, action) => {
        state.todayTasks = action.payload;
      })
      .addCase(fetchOverdueTasks.fulfilled, (state, action) => {
        state.overdueTasks = action.payload;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.allTasks.unshift(action.payload);
        if (action.payload.status === 'pending' || action.payload.status === 'in-progress') {
          state.pendingTasks.unshift(action.payload);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const taskDate = new Date(action.payload.dueDate);
        if (taskDate >= today && taskDate < tomorrow) {
          state.todayTasks.unshift(action.payload);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const updateTasks = (tasks: Task[]) => {
          return tasks.map(task => 
            task._id === action.payload._id ? action.payload : task
          );
        };
        state.allTasks = updateTasks(state.allTasks);
        state.pendingTasks = updateTasks(state.pendingTasks);
        state.todayTasks = updateTasks(state.todayTasks);
        state.overdueTasks = updateTasks(state.overdueTasks);
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.allTasks = state.allTasks.filter(task => task._id !== action.payload);
        state.pendingTasks = state.pendingTasks.filter(task => task._id !== action.payload);
        state.todayTasks = state.todayTasks.filter(task => task._id !== action.payload);
        state.overdueTasks = state.overdueTasks.filter(task => task._id !== action.payload);
        if (state.selectedTask?._id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(markTaskAsComplete.fulfilled, (state, action) => {
        const updateTasks = (tasks: Task[]) => {
          return tasks.map(task => 
            task._id === action.payload._id ? action.payload : task
          );
        };
        state.allTasks = updateTasks(state.allTasks);
        state.pendingTasks = updateTasks(state.pendingTasks);
        state.todayTasks = updateTasks(state.todayTasks);
        state.overdueTasks = updateTasks(state.overdueTasks);
        if (state.selectedTask?._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      });
  },
});

export const { 
  clearError, 
  setFilter, 
  selectTask, 
  clearSelectedTask,
  updateTaskStatusOptimistic
} = tasksSlice.actions;

export default tasksSlice.reducer;