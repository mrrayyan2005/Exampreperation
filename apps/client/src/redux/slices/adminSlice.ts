import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminApi, PlatformStats, AdminUsersResponse } from '../../api/adminApi';
import { User } from './authSlice'; // Use the User interface defined inside authSlice directly

interface AdminState {
    stats: PlatformStats | null;
    users: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    stats: null,
    users: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    },
    loading: false,
    error: null
};

// Async Thunks
export const fetchPlatformStats = createAsyncThunk(
    'admin/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            return await adminApi.getPlatformStats();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch platform stats');
        }
    }
);

export const fetchAdminUsers = createAsyncThunk(
    'admin/fetchUsers',
    async ({ page, limit, search }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
        try {
            return await adminApi.getAllUsers(page, limit, search);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ userId, role, isActive }: { userId: string; role: string; isActive?: boolean }, { rejectWithValue }) => {
        try {
            return await adminApi.updateUserRole(userId, role, isActive);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user');
        }
    }
);

export const deleteUser = createAsyncThunk(
    'admin/deleteUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            await adminApi.deleteUser(userId);
            return userId; // Return the ID so we can filter it out of the state
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Stats
            .addCase(fetchPlatformStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPlatformStats.fulfilled, (state, action: PayloadAction<PlatformStats>) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchPlatformStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Users
            .addCase(fetchAdminUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminUsers.fulfilled, (state, action: PayloadAction<AdminUsersResponse>) => {
                state.loading = false;
                state.users = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchAdminUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update User
            .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
                // Find and update the user in the array
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })

            // Delete User
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.users = state.users.filter(u => u.id !== action.payload);
            });
    }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
