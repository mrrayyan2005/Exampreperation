
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { schoolTaskApi, SchoolTask, CreateSchoolTaskRequest } from '../../api/schoolTaskApi';

interface SchoolTaskState {
    tasks: SchoolTask[];
    loading: boolean;
    error: string | null;
}

const initialState: SchoolTaskState = {
    tasks: [],
    loading: false,
    error: null,
};

export const fetchTasks = createAsyncThunk(
    'schoolTasks/fetchTasks',
    async (params: { status?: string; subject?: string; type?: string; dueDate?: string } | undefined, { rejectWithValue }) => {
        try {
            return await schoolTaskApi.getTasks(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
        }
    }
);

export const createTask = createAsyncThunk(
    'schoolTasks/createTask',
    async (data: CreateSchoolTaskRequest, { rejectWithValue }) => {
        try {
            return await schoolTaskApi.createTask(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create task');
        }
    }
);

export const updateTask = createAsyncThunk(
    'schoolTasks/updateTask',
    async ({ id, data }: { id: string; data: Partial<CreateSchoolTaskRequest> }, { rejectWithValue }) => {
        try {
            return await schoolTaskApi.updateTask(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update task');
        }
    }
);

export const deleteTask = createAsyncThunk(
    'schoolTasks/deleteTask',
    async (id: string, { rejectWithValue }) => {
        try {
            await schoolTaskApi.deleteTask(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
        }
    }
);

const schoolTaskSlice = createSlice({
    name: 'schoolTasks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasks.push(action.payload);
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.tasks.findIndex((t) => t._id === action.payload._id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.tasks = state.tasks.filter((t) => t._id !== action.payload);
            });
    },
});

export default schoolTaskSlice.reducer;
