
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { schoolExamApi, SchoolExam, CreateSchoolExamRequest } from '../../api/schoolExamApi';

interface SchoolExamState {
    exams: SchoolExam[];
    loading: boolean;
    error: string | null;
}

const initialState: SchoolExamState = {
    exams: [],
    loading: false,
    error: null,
};

export const fetchExams = createAsyncThunk(
    'schoolExams/fetchExams',
    async (params: { subject?: string; date?: string; startDate?: string; endDate?: string } | undefined, { rejectWithValue }) => {
        try {
            return await schoolExamApi.getExams(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
        }
    }
);

export const createExam = createAsyncThunk(
    'schoolExams/createExam',
    async (data: CreateSchoolExamRequest, { rejectWithValue }) => {
        try {
            return await schoolExamApi.createExam(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create exam');
        }
    }
);

export const updateExam = createAsyncThunk(
    'schoolExams/updateExam',
    async ({ id, data }: { id: string; data: Partial<CreateSchoolExamRequest> }, { rejectWithValue }) => {
        try {
            return await schoolExamApi.updateExam(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update exam');
        }
    }
);

export const deleteExam = createAsyncThunk(
    'schoolExams/deleteExam',
    async (id: string, { rejectWithValue }) => {
        try {
            await schoolExamApi.deleteExam(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete exam');
        }
    }
);

const schoolExamSlice = createSlice({
    name: 'schoolExams',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExams.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExams.fulfilled, (state, action) => {
                state.loading = false;
                state.exams = action.payload;
            })
            .addCase(fetchExams.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createExam.fulfilled, (state, action) => {
                state.exams.push(action.payload);
            })
            .addCase(updateExam.fulfilled, (state, action) => {
                const index = state.exams.findIndex((e) => e._id === action.payload._id);
                if (index !== -1) {
                    state.exams[index] = action.payload;
                }
            })
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.exams = state.exams.filter((e) => e._id !== action.payload);
            });
    },
});

export default schoolExamSlice.reducer;
