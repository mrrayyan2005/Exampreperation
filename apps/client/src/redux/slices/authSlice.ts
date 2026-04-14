import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
 import axiosInstance from '@/api/axiosInstance';
 
 export interface User {
   id: string;
   name: string;
   email: string;
   role: 'student' | 'admin' | 'institution_admin' | 'teacher';
   institution?: string;
   examTypes?: string[];
   examDate?: string;
   streak?: number;
   streakFreezes?: number;
   isActive?: boolean;
   createdAt?: string;
   profilePicture?: string;
   location?: string;
   bio?: string;
   institutionName?: string;
 }
 
 interface LoginResponse {
   user?: User;
   token?: string;
   mfaRequired?: boolean;
   userId?: string;
 }
 
 interface RegisterResponse {
   user: User;
   token: string;
 }
 
 interface AuthState {
   user: User | null;
   token: string | null;
   isAuthenticated: boolean;
   isLoading: boolean;
   isInitialized: boolean;
   error: string | null;
   mfaRequired: boolean;
   tempUserId: string | null; // For MFA verification state
 }
 
 const initialState: AuthState = {
   user: null,
   token: localStorage.getItem('authToken'),
   isAuthenticated: !!localStorage.getItem('authToken'),
   isLoading: false,
   isInitialized: false,
   error: null,
   mfaRequired: false,
   tempUserId: null
 };
 
 // Standard Login
 export const login = createAsyncThunk<LoginResponse, { email: string; password: string }>(
   'auth/login',
   async (credentials, { rejectWithValue }) => {
     try {
       const response = await axiosInstance.post('/auth/login', credentials);
       const data = response.data;
 
       if (data.data.mfaRequired) {
         return { mfaRequired: true, userId: data.data.userId };
       }
 
       localStorage.setItem('authToken', data.data.token);
       return data.data;
     } catch (error: any) {
       const errorMessage = error.response?.data?.message || error.message || 'Login failed';
       return rejectWithValue(errorMessage);
     }
   }
 );
 
 // Google Login
 export const googleLogin = createAsyncThunk<LoginResponse, { googleId: string; email: string; name: string; profilePicture?: string }>(
   'auth/googleLogin',
   async (credentials, { rejectWithValue }) => {
     try {
       const response = await axiosInstance.post('/auth/google', credentials);
       const data = response.data;
 
       localStorage.setItem('authToken', data.data.token);
       return data.data;
     } catch (error: any) {
       const errorMessage = error.response?.data?.message || error.message || 'Google Login failed';
       return rejectWithValue(errorMessage);
     }
   }
 );
 
 // Verify MFA Login
 export const verifyMfaLogin = createAsyncThunk<LoginResponse, { userId: string; token: string }>(
   'auth/verifyMfaLogin',
   async (data, { rejectWithValue }) => {
     try {
       const response = await axiosInstance.post('/auth/mfa/verify-login', data);
       localStorage.setItem('authToken', response.data.data.token);
       return response.data.data;
     } catch (error: any) {
       const errorMessage = error.response?.data?.message || error.message || 'MFA Verification failed';
       return rejectWithValue(errorMessage);
     }
   }
 );
 
 export const register = createAsyncThunk<RegisterResponse, { name: string; email: string; password: string; examTypes: string[]; examDate: string }>(
   'auth/register',
   async (userData, { rejectWithValue }) => {
     try {
       const response = await axiosInstance.post('/auth/register', userData);
       localStorage.setItem('authToken', response.data.data.token);
       return response.data.data;
     } catch (error: any) {
       const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
       return rejectWithValue(errorMessage);
     }
   }
 );
 
 export const fetchProfile = createAsyncThunk<User, void>(
   'auth/fetchProfile',
   async (_, { rejectWithValue }) => {
     try {
       const response = await axiosInstance.get('/auth/me');
       return response.data.data.user;
     } catch (error: any) {
       // Only reject with error details, don't clear token here
       const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch profile';
       const statusCode = error?.response?.status;
       return rejectWithValue({ message: errorMessage, statusCode });
     }
   }
 );
 
 const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
     logout: (state) => {
       state.user = null;
       state.token = null;
       state.isAuthenticated = false;
       state.mfaRequired = false;
       state.tempUserId = null;
       localStorage.removeItem('authToken');
       axiosInstance.post('/auth/logout').catch(() => { });
     },
     clearError: (state) => {
       state.error = null;
     },
     resetMfa: (state) => {
       state.mfaRequired = false;
       state.tempUserId = null;
     }
   },
   extraReducers: (builder) => {
     builder
       // Login
       .addCase(login.pending, (state) => {
         state.isLoading = true;
         state.error = null;
       })
       .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
         state.isLoading = false;
         state.isInitialized = true;
 
         if (action.payload.mfaRequired) {
           state.mfaRequired = true;
           state.tempUserId = action.payload.userId || null;
           state.isAuthenticated = false;
         } else {
           state.user = action.payload.user!;
           state.token = action.payload.token!;
           state.isAuthenticated = true;
           state.mfaRequired = false;
           state.tempUserId = null;
         }
       })
       .addCase(login.rejected, (state, action) => {
         state.isLoading = false;
         state.isInitialized = true;
         state.error = action.payload as string;
       })
       // Google Login
       .addCase(googleLogin.pending, (state) => {
         state.isLoading = true;
         state.error = null;
       })
       .addCase(googleLogin.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
         state.isLoading = false;
         state.isInitialized = true;
         state.user = action.payload.user!;
         state.token = action.payload.token!;
         state.isAuthenticated = true;
         state.mfaRequired = false;
         state.tempUserId = null;
       })
       .addCase(googleLogin.rejected, (state, action) => {
         state.isLoading = false;
         state.isInitialized = true;
         state.error = action.payload as string;
       })
       // MFA Verification
       .addCase(verifyMfaLogin.pending, (state) => {
         state.isLoading = true;
         state.error = null;
       })
       .addCase(verifyMfaLogin.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
         state.isLoading = false;
         state.user = action.payload.user!;
         state.token = action.payload.token!;
         state.isAuthenticated = true;
         state.mfaRequired = false;
         state.tempUserId = null;
       })
       .addCase(verifyMfaLogin.rejected, (state, action) => {
         state.isLoading = false;
         state.error = action.payload as string;
       })
       // Register
       .addCase(register.pending, (state) => {
         state.isLoading = true;
         state.error = null;
       })
       .addCase(register.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
         state.isLoading = false;
         state.isInitialized = true;
         state.user = action.payload.user;
         state.token = action.payload.token;
         state.isAuthenticated = true;
       })
       .addCase(register.rejected, (state, action) => {
         state.isLoading = false;
         state.error = action.payload as string;
       })
       // Fetch Profile
       .addCase(fetchProfile.pending, (state) => {
         state.isLoading = true;
       })
       .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<User>) => {
         state.isLoading = false;
         state.isInitialized = true;
         state.user = action.payload;
         state.isAuthenticated = true;
       })
       .addCase(fetchProfile.rejected, (state, action) => {
         state.isLoading = false;
         state.isInitialized = true;
         
         // Only clear token and logout if it's a 401 (authentication error)
         // For other errors (network, server errors), keep the token
         const error = action.payload as { message: string; statusCode?: number };
         if (error?.statusCode === 401) {
           state.token = null;
           state.isAuthenticated = false;
           state.user = null;
           localStorage.removeItem('authToken');
         }
         // If it's just a network error or temporary issue, keep user logged in
       });
   },
 });
 
 export const { logout, clearError, resetMfa } = authSlice.actions;
 export default authSlice.reducer;