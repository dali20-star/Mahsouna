import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference to auth context setter for interceptor
let authContextSetter = null;

export const setAuthContextSetter = (setter) => {
  authContextSetter = setter;
};

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh and auth state management
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login/') &&
      !originalRequest.url.includes('/users/register/')
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          console.log('🔄 Token expired, attempting refresh...');
          const response = await axios.post(`${API_URL}/users/token/refresh/`, {
            refresh: refreshToken,
          });
          console.log('✅ Token refreshed successfully');
          
          localStorage.setItem('access_token', response.data.access);
          api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

          // Retry original request with new token
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          
          // Clear tokens and auth state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_role');

          // Clear shared auth state via context
          if (authContextSetter) {
            authContextSetter(null);
          }

          // Redirect to login
          window.location.href = '/login';
        }
      } else {
        // No refresh token available - clear auth state
        console.log('❌ No refresh token - clearing auth state');
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');

        // Clear shared auth state via context
        if (authContextSetter) {
          authContextSetter(null);
        }

        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
