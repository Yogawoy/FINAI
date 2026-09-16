import { Platform } from 'react-native';

/**
 * FinAI Mobile Centralized Configuration
 * 
 * SECURITY RULE:
 * Absolutely NO DATABASE_URL, GROQ_API_KEY, AUTH_SECRET, or server passwords.
 * Only public client-safe endpoints and runtime configuration.
 */

// Host IP of dev machine when testing on physical device on the same local Wi-Fi
const DEV_LAN_IP = '192.168.100.12:3000';

function resolveDefaultApiBaseUrl(): string {
  if (__DEV__) {
    // If running in development
    if (Platform.OS === 'android') {
      // For physical Android phone, use laptop Wi-Fi IP
      // For Android emulator, use 10.0.2.2:3000
      return `http://${DEV_LAN_IP}`;
    }
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000';
    }
    return 'http://localhost:3000';
  }

  // Production Vercel / Cloud URL
  return 'https://finai-app.vercel.app';
}

export const config = {
  appName: 'FinAI',
  version: '1.0.0',
  apiBaseUrl: resolveDefaultApiBaseUrl(),
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
