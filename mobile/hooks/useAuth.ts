import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
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

export function useAuth(): UseAuthReturn {
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

      // Query /api/auth/me
      const data = await apiClient.get<{ user: SafeUser }>(config.endpoints.auth.me);
      if (data?.user) {
        setUser(data.user);
      } else {
        await clearSession();
        setUser(null);
      }
    } catch {
      // In Step 1 foundation, if offline or not logged in, clear session
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiClient.post<{ user: SafeUser; token?: string }>(
        config.endpoints.auth.login,
        payload
      );
      if (data?.user) {
        setUser(data.user);
        if (data.token) {
          await setSessionToken(data.token);
        }
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
      if (data?.user) {
        setUser(data.user);
        if (data.token) {
          await setSessionToken(data.token);
        }
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
      // Ignore logout network errors
    } finally {
      await clearSession();
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    checkSession,
    login,
    register,
    logout,
  };
}

export default useAuth;
