import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import bookSlice from './slices/bookSlice';
import monthlyPlanSlice from './slices/monthlyPlanSlice';
import studySessionSlice from './slices/studySessionSlice';
import syllabusSlice from './slices/syllabusSlice';
import upscResourceSlice from './slices/upscResourceSlice';
import uiSlice from './slices/uiSlice';
import resourceSlice from './slices/resourceSlice';
import subjectSlice from './slices/subjectSlice';
import classSlice from './slices/classSlice';
import schoolTaskSlice from './slices/schoolTaskSlice';
import schoolExamSlice from './slices/schoolExamSlice';
import tasksSlice from './slices/tasksSlice';
import examsSlice from './slices/examsSlice';
import chatSlice from './slices/chatSlice';
import adminSlice from './slices/adminSlice';
import flowchartSlice from './slices/flowchartSlice';
import communitySlice from './slices/communitySlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    books: bookSlice,
    // dailyGoals removed (refactored to React Query)
    monthlyPlans: monthlyPlanSlice,
    studySessions: studySessionSlice,
    syllabus: syllabusSlice,
    upscResources: upscResourceSlice,
    ui: uiSlice,
    resources: resourceSlice,
    subjects: subjectSlice,
    classes: classSlice,
    schoolTasks: schoolTaskSlice,
    schoolExams: schoolExamSlice,
    // MyStudyLife slices
    tasks: tasksSlice,
    exams: examsSlice,
    // AI Chat Agent slice
    chat: chatSlice,
    // Admin Module slice
    admin: adminSlice,
    // Flowchart slice
    flowchart: flowchartSlice,
    // Community slice
    community: communitySlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
