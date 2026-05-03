import React, { createContext } from 'react';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  fetchUser: async () => {},
  setAuthState: () => {},
});

export default AuthContext;
