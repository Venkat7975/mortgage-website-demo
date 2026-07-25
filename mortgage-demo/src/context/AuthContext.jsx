import { createContext, useContext, useState, useCallback } from 'react';
import {
  getFullCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../services/customerService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getFullCurrentUser());

  const login = useCallback((credentials) => {
    const result = loginUser(credentials);
    if (result.success) setUser(result.user);
    return result;
  }, []);

  const register = useCallback((details) => {
    const result = registerUser(details);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    setUser(getFullCurrentUser());
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
