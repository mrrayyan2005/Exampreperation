import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  // Append /api if not present
  return url.endsWith('/api') ? url : `${url}/api`;
};


// Different timeout configs for different request types
const getTimeout = (url?: string) => {
  // Dashboard initial load - needs more time for heavy queries
  if (url?.includes('/books') || url?.includes('/study-sessions')) {
    return 30000; // 30 seconds for initial dashboard data
  }
  // Analytics queries
  if (url?.includes('/analytics')) {
    return 15000; // 15 seconds for analytics
  }
  // Default for most requests
  return 10000;
};

const axiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Default, will be overridden per request
  withCredentials: true, // Enable sending cookies
});


// Request interceptor to add JWT token and adjust timeout
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set dynamic timeout based on endpoint
    config.timeout = getTimeout(config.url);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


const MAX_RETRIES = 2; // Reduced from 3
const RETRY_DELAY = 500; // Reduced from 1000ms

const isRetryableError = (error: any) => {
  // Only retry on specific server errors, not timeout
  return error.response && 
    [502, 503, 504].includes(error.response.status);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry on timeout for dashboard initial load - let it complete
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isDashboardLoad = originalRequest.url?.includes('/books') || 
                           originalRequest.url?.includes('/study-sessions');
    
    if (isTimeout && isDashboardLoad) {
      // Don't retry - the user should see the timeout error and retry manually
      // or the server needs optimization
      console.error('Dashboard data load timed out. Server may be slow or overloaded.');
      return Promise.reject(error);
    }
    
    // Retry logic - only for idempotent requests that aren't dashboard initial load
    if (
      isRetryableError(error) && 
      (!originalRequest._retryCount || originalRequest._retryCount < MAX_RETRIES) &&
      ['GET', 'PUT', 'DELETE'].includes(originalRequest.method?.toUpperCase() || '') &&
      !isDashboardLoad
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Shorter exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
      console.warn(`API Error: ${error.message}. Retrying in ${delay}ms... (Attempt ${originalRequest._retryCount})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(originalRequest);
    }

    // List of auth routes that should not trigger refresh
    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/google') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._authRetry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._authRetry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post('/auth/refresh');
        const { token } = response.data.data;
        localStorage.setItem('authToken', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('authToken');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Final Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
