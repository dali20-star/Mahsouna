import React, { useState, useCallback, useEffect, useRef } from 'react';
import AuthContext from './AuthContext';
import api, { setAuthContextSetter } from '../utils/api';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Track if we just completed login to skip duplicate fetchUser()
  const justLoggedInRef = useRef(false);

  // Fetch user profile - reads token from localStorage
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      const response = await api.get('/users/profile/me/');
      setUser(response.data);
      setIsAuthenticated(true);

      // Store user role for easy access
      if (response.data.role) {
        localStorage.setItem('user_role', response.data.role);
      }
      return true;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      return false;
    }
  }, []);

  // Check authentication status on app load - but skip if we just logged in
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // If we just logged in, user state is already set by login() function
      // Skip the API call to /users/profile/me/
      if (justLoggedInRef.current) {
        console.log('✅ Just logged in - skipping duplicate fetchUser()');
        justLoggedInRef.current = false; // Reset flag
        setLoading(false);
        return;
      }
      
      // For app initialization with existing token, verify it by fetching user
      await fetchUser();
      setLoading(false);
    };
    
    checkAuth();
  }, [fetchUser]);

  // Login - UPDATED: Use user data from login response instead of extra API call
  const login = useCallback(
    async (username, password) => {
      try {
        console.log('🔐 Attempting login with:', username);
        const response = await api.post('/users/login/', { username, password });
        console.log('✅ Login response received');

        // Store tokens immediately
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // ⚡ NEW: Use user data from login response (no second API call!)
        const userData = response.data.user;
        console.log('👤 Profile from login response:', userData.username);

        // Update shared auth state immediately with data from login response
        setUser(userData);
        setIsAuthenticated(true);
        
        // Mark that we just logged in so checkAuth() skips duplicate fetchUser()
        justLoggedInRef.current = true;

        // Store user role
        if (userData.role) {
          localStorage.setItem('user_role', userData.role);
        }

        console.log('✅ Auth state updated (no duplicate API call)');
        return {
          ...response.data,
          role: userData.role,
        };
      } catch (error) {
        console.error('❌ Login error:', error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw error;
      }
    },
    []
  );

  // Register
  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/users/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error.response?.data);
      throw error;
    }
  }, []);

  // Logout - clears shared auth state immediately
  const logout = useCallback(() => {
    console.log('🚪 Logout: Clearing tokens and shared state');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    justLoggedInRef.current = false; // Reset flag
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ Logout complete');
  }, []);

  // Manual auth state setter (for interceptor and other edge cases)
  const setAuthState = useCallback((authData) => {
    if (authData === null) {
      setIsAuthenticated(false);
      setUser(null);
      justLoggedInRef.current = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
    } else {
      setIsAuthenticated(authData.isAuthenticated || false);
      setUser(authData.user || null);
    }
  }, []);

  // Register auth state setter with API interceptor so it can clear auth on 401
  useEffect(() => {
    setAuthContextSetter(setAuthState);
  }, [setAuthState]);

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    fetchUser,
    setAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
