import { Platform } from 'react-native';

/**
 * FinAI Mobile Centralized Configuration
 * 
 * SECURITY RULE:
 * Absolutely NO DATABASE_URL, GROQ_API_KEY, AUTH_SECRET, or server passwords.
 * Only public client-safe endpoints and runtime configuration.
 */

import Constants from 'expo-constants';

// Environment configurations
export type Environment = 'development_emulator' | 'development_device' | 'staging' | 'production';

// Configurable host for physical device testing over local Wi-Fi
export const DEV_PHYSICAL_DEVICE_HOST = '192.168.100.12:3000';

// Configurable production URL
export const PRODUCTION_API_URL = 'https://finai-app.vercel.app';

export function resolveApiBaseUrl(targetEnv?: Environment): string {
  if (targetEnv === 'production') {
    return PRODUCTION_API_URL;
  }
  if (targetEnv === 'development_emulator') {
    return 'http://10.0.2.2:3000';
  }
  if (targetEnv === 'development_device') {
    return `http://${DEV_PHYSICAL_DEVICE_HOST}`;
  }

  // Automatic resolution in dev
  if (__DEV__) {
    // 1. If running in Android Emulator
    // Detect if hostUri is available from Expo dev server
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      return `http://${hostIp}:3000`;
    }

    if (Platform.OS === 'android') {
      // Standard Android Emulator loopback
      return 'http://10.0.2.2:3000';
    }

    return 'http://localhost:3000';
  }

  return PRODUCTION_API_URL;
}


export const config = {
  appName: 'FinAI',
  version: '1.0.0',
  apiBaseUrl: resolveApiBaseUrl(),
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
    },
    wallets: '/api/wallets',
    transactions: '/api/transactions',
    budgets: '/api/budgets',
    goals: '/api/goals',
    transfers: '/api/transfers',
    settings: '/api/settings',
    aiChat: '/api/ai/chat',
  },
  timeoutMs: 15000,
} as const;

export default config;
