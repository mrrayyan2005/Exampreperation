import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { examsApi, Exam } from '@/api/learningDomain/exams';
import type { CreateExamInput } from '@/api/learningDomain/exams';

interface ExamsState {
  allExams: Exam[];
  upcomingExams: Exam[];
  selectedExam: Exam | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ExamsState = {
  allExams: [],
  upcomingExams: [],
  selectedExam: null,
  isLoading: false,
  error: null,
};

export const fetchAllExams = createAsyncThunk('exams/fetchAll', async () => {
  return await examsApi.getAll();
});

export const fetchUpcomingExams = createAsyncThunk('exams/fetchUpcoming', async (limit: number = 10) => {
  return await examsApi.getUpcoming(limit);
});

export const createExam = createAsyncThunk('exams/create', async (data: CreateExamInput) => {
  return await examsApi.create(data);
});

export const updateExam = createAsyncThunk('exams/update', async ({ id, data }: { id: string; data: Partial<Exam> }) => {
  return await examsApi.update(id, data);
});

export const deleteExam = createAsyncThunk('exams/delete', async (id: string) => {
  await examsApi.delete(id);
  return id;
});

const examsSlice = createSlice({
  name: 'exams',
  initialState,
  reducers: {
    selectExam: (state, action) => {
      state.selectedExam = action.payload;
    },
    clearSelectedExam: (state) => {
      state.selectedExam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExams.fulfilled, (state, action) => {
        state.allExams = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAllExams.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.allExams = [];
      })
      .addCase(fetchUpcomingExams.fulfilled, (state, action) => {
        state.upcomingExams = action.payload;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.allExams.unshift(action.payload);
        if (action.payload.status === 'upcoming' || action.payload.status === 'scheduled') {
          state.upcomingExams.unshift(action.payload);
        }
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.allExams = state.allExams.map(e => e._id === action.payload._id ? action.payload : e);
        state.upcomingExams = state.upcomingExams.map(e => e._id === action.payload._id ? action.payload : e);
        if (state.selectedExam?._id === action.payload._id) {
          state.selectedExam = action.payload;
        }
      })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.allExams = state.allExams.filter(e => e._id !== action.payload);
        state.upcomingExams = state.upcomingExams.filter(e => e._id !== action.payload);
        if (state.selectedExam?._id === action.payload) {
          state.selectedExam = null;
        }
      });
  },
});

export const { selectExam, clearSelectedExam } = examsSlice.actions;
export default examsSlice.reducer;