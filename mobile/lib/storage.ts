/**
 * FinAI Mobile Secure Storage Abstraction
 * 
 * SECURITY RULE:
 * Never store passwords, database credentials, or server secrets.
 * This abstraction manages client-side authentication tokens / sessions safely.
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// In-memory fallback adapter for initial foundation
class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// Storage keys
export const STORAGE_KEYS = {
  SESSION_TOKEN: 'finai_mobile_session_token',
  USER_INFO: 'finai_mobile_user_info',
  DEVICE_SETTINGS: 'finai_mobile_device_settings',
} as const;

// Default storage instance
export const storage: StorageAdapter = new MemoryStorageAdapter();

export async function getSessionToken(): Promise<string | null> {
  return storage.getItem(STORAGE_KEYS.SESSION_TOKEN);
}

export async function setSessionToken(token: string): Promise<void> {
  await storage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
}

export async function clearSession(): Promise<void> {
  await storage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  await storage.removeItem(STORAGE_KEYS.USER_INFO);
}

export default storage;
