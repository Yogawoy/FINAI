/**
 * FinAI Standard API Response Types (matches backend src/lib/api-response.ts)
 */

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BUDGET_NOT_FOUND'
  | 'GOAL_NOT_FOUND'
  | 'WALLET_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_BALANCE'
  | 'WALLET_IN_USE'
  | 'BUDGET_IN_USE'
  | 'GOAL_IN_USE'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR';

export interface ApiErrorDetail {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]> | unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
