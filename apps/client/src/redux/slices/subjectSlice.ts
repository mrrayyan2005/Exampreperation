
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subjectApi, Subject, CreateSubjectRequest } from '../../api/subjectApi';

interface SubjectState {
    subjects: Subject[];
    loading: boolean;
    error: string | null;
}

const initialState: SubjectState = {
    subjects: [],
    loading: false,
    error: null,
};

export const fetchSubjects = createAsyncThunk(
    'subjects/fetchSubjects',
    async (_, { rejectWithValue }) => {
        try {
            return await subjectApi.getSubjects();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
        }
    }
);

export const createSubject = createAsyncThunk(
    'subjects/createSubject',
    async (data: CreateSubjectRequest, { rejectWithValue }) => {
        try {
            return await subjectApi.createSubject(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create subject');
        }
    }
);

export const updateSubject = createAsyncThunk(
    'subjects/updateSubject',
    async ({ id, data }: { id: string; data: Partial<CreateSubjectRequest> }, { rejectWithValue }) => {
        try {
            return await subjectApi.updateSubject(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
        }
    }
);

export const deleteSubject = createAsyncThunk(
    'subjects/deleteSubject',
    async (id: string, { rejectWithValue }) => {
        try {
            await subjectApi.deleteSubject(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
        }
    }
);

const subjectSlice = createSlice({
    name: 'subjects',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchSubjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.loading = false;
                state.subjects = action.payload;
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createSubject.fulfilled, (state, action) => {
                state.subjects.push(action.payload);
            })
            // Update
            .addCase(updateSubject.fulfilled, (state, action) => {
                const index = state.subjects.findIndex((s) => s._id === action.payload._id);
                if (index !== -1) {
                    state.subjects[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.subjects = state.subjects.filter((s) => s._id !== action.payload);
            });
    },
});

export default subjectSlice.reducer;
