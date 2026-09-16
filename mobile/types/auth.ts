/**
 * FinAI Mobile Auth Types
 */

export interface SafeUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthSessionData {
  user: SafeUser;
  token?: string; // For mobile token support
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
