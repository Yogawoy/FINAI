import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * FinAI Mobile Secure Storage Implementation
 * 
 * Uses hardware-backed Android Keystore / iOS Keychain via expo-secure-store.
 * 
 * SECURITY MANDATES:
 * 1. Strictly NEVER store user passwords, database credentials, or server secrets.
 * 2. Strictly DO NOT use plaintext persistent storage (e.g. unencrypted AsyncStorage)
 *    for authentication tokens or sensitive credentials.
 * 3. Token is kept safely encrypted on-device and cleared on logout or 401.
 */

export interface SecureStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export const STORAGE_KEYS = {
  SESSION_TOKEN: 'finai_mobile_session_token',
  USER_INFO: 'finai_mobile_user_info',
  DEVICE_SETTINGS: 'finai_mobile_device_settings',
} as const;

class ExpoSecureStoreAdapter implements SecureStorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
    } catch (err) {
      console.warn('Gagal menyimpan token ke SecureStore:', err);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }

  async clear(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    await this.removeItem(STORAGE_KEYS.USER_INFO);
  }
}

export const storage: SecureStorageAdapter = new ExpoSecureStoreAdapter();

export async function getSessionToken(): Promise<string | null> {
  return storage.getItem(STORAGE_KEYS.SESSION_TOKEN);
}

export async function setSessionToken(token: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
}

export async function removeSessionToken(): Promise<void> {
  await storage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
}

export async function clearSession(): Promise<void> {
  await storage.clear();
}

// Named aliases for clean API consumption
export const getToken = getSessionToken;
export const saveToken = setSessionToken;
export const removeToken = removeSessionToken;

export default storage;

