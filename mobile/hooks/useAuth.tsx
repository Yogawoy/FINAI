import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient, setUnauthorizedHandler } from '../lib/api-client';
import { getSessionToken, setSessionToken, clearSession } from '../lib/storage';
import { config } from '../lib/config';
import type { SafeUser, LoginPayload, RegisterPayload } from '../types/auth';

export interface UseAuthReturn {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<UseAuthReturn | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Query /api/auth/me with Bearer token
      const data = await apiClient.get<{ user: SafeUser }>(config.endpoints.auth.me);
      if (data?.user) {
        setUser(data.user);
      } else {
        await clearSession();
        setUser(null);
      }
    } catch {
      await clearSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Register 401 callback to immediately clear auth state across components
    setUnauthorizedHandler(() => {
      setUser(null);
    });

    checkSession();
  }, [checkSession]);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<{ user: SafeUser; token?: string }>(
        config.endpoints.auth.login,
        payload
      );

      if (data?.token) {
        await setSessionToken(data.token);
      }

      if (data?.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<{ user: SafeUser; token?: string }>(
        config.endpoints.auth.register,
        payload
      );

      if (data?.token) {
        await setSessionToken(data.token);
      }

      if (data?.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post(config.endpoints.auth.logout);
    } catch {
      // Offline / network failure: local session is still cleaned safely
    } finally {
      await clearSession();
      setUser(null);
    }
  };

  const value: UseAuthReturn = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    checkSession,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;

