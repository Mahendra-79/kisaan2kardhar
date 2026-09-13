import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  token: string | null;
  login: (email: string, role: Role, adminPassKey?: string) => Promise<User>;
  demoLogin: (role: Role, adminPassKey?: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<User>;
  updateUser: (updates: Partial<User>) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('k2k_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('k2k_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const role = currentUser ? currentUser.role : null;

  const login = async (email: string, targetRole: Role, adminPassKey?: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, role: targetRole, adminPassKey });
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('k2k_user', JSON.stringify(res.user));
      localStorage.setItem('k2k_token', res.token);
      return res.user;
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (targetRole: Role, adminPassKey?: string): Promise<User> => {
    const demoEmails: Record<Role, string> = {
      farmer: 'farmer@kisaan.com',
      fpo: 'fpo@kisaan.com',
      customer: 'customer@kisaan.com',
      bulkBuyer: 'bulkbuyer@kisaan.com',
      logisticsProvider: 'logistics@kisaan.com',
      admin: 'admin@kisaan2karidhar.gov.in'
    };

    return login(demoEmails[targetRole], targetRole, adminPassKey);
  };

  const register = async (userData: Partial<User>): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.register(userData);
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('k2k_user', JSON.stringify(res.user));
      localStorage.setItem('k2k_token', res.token);
      return res.user;
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<User> => {
    if (!currentUser) throw new Error('No user logged in');
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.updateUserProfile(currentUser.id, updates);
      const updated = res.user;
      setCurrentUser(updated);
      localStorage.setItem('k2k_user', JSON.stringify(updated));
      return updated;
    } catch (err: any) {
      // Fallback local update if network is transient
      const merged: User = { ...currentUser, ...updates } as User;
      setCurrentUser(merged);
      localStorage.setItem('k2k_user', JSON.stringify(merged));
      return merged;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('k2k_user');
    localStorage.removeItem('k2k_token');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        token,
        login,
        demoLogin,
        register,
        updateUser,
        logout,
        isLoading,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
