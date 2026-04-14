
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { classApi, ClassSession, CreateClassRequest } from '../../api/classApi';

interface ClassState {
    classes: ClassSession[];
    loading: boolean;
    error: string | null;
}

const initialState: ClassState = {
    classes: [],
    loading: false,
    error: null,
};

export const fetchClasses = createAsyncThunk(
    'classes/fetchClasses',
    async (params: { day?: string; isRecurring?: boolean } | undefined, { rejectWithValue }) => {
        try {
            return await classApi.getClasses(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch classes');
        }
    }
);

export const createClass = createAsyncThunk(
    'classes/createClass',
    async (data: CreateClassRequest, { rejectWithValue }) => {
        try {
            return await classApi.createClass(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create class');
        }
    }
);

export const updateClass = createAsyncThunk(
    'classes/updateClass',
    async ({ id, data }: { id: string; data: Partial<CreateClassRequest> }, { rejectWithValue }) => {
        try {
            return await classApi.updateClass(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update class');
        }
    }
);

export const deleteClass = createAsyncThunk(
    'classes/deleteClass',
    async (id: string, { rejectWithValue }) => {
        try {
            await classApi.deleteClass(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete class');
        }
    }
);

const classSlice = createSlice({
    name: 'classes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClasses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClasses.fulfilled, (state, action) => {
                state.loading = false;
                state.classes = action.payload;
            })
            .addCase(fetchClasses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createClass.fulfilled, (state, action) => {
                state.classes.push(action.payload);
            })
            .addCase(updateClass.fulfilled, (state, action) => {
                const index = state.classes.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.classes[index] = action.payload;
                }
            })
            .addCase(deleteClass.fulfilled, (state, action) => {
                state.classes = state.classes.filter((c) => c._id !== action.payload);
            });
    },
});

export default classSlice.reducer;
