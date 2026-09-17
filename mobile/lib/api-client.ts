import { config } from './config';
import { getSessionToken, clearSession } from './storage';
import type { ApiErrorResponse, ApiSuccessResponse, ErrorCode } from '../types/api';

export class ApiClientError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(status: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export type UnauthorizedHandler = () => void | Promise<void>;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function mapErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401 || error.code === 'UNAUTHORIZED') {
      return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
    }
    if (error.status === 403 || error.code === 'FORBIDDEN') {
      return 'Anda tidak memiliki hak akses untuk layanan ini.';
    }
    if (error.status === 404 || error.code === 'NOT_FOUND') {
      return 'Data atau layanan yang diminta tidak ditemukan.';
    }
    if (error.status === 409 || error.code === 'CONFLICT' || error.code === 'EMAIL_ALREADY_EXISTS') {
      return error.message || 'Data sudah terdaftar atau terjadi konflik data.';
    }
    if (error.status === 422) {
      return error.message || 'Data yang dikirim tidak dapat diproses oleh server.';
    }
    if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
      return error.message || 'Data yang dimasukkan tidak valid.';
    }
    if (error.status === 408 || error.code === 'NETWORK_ERROR') {
      return error.message || 'Permintaan melebihi batas waktu (timeout).';
    }
    if (error.status === 500 || error.code === 'INTERNAL_ERROR') {
      return 'Terjadi kesalahan sistem pada server FinAI. Silakan coba sesaat lagi.';
    }
    return error.message || 'Terjadi kesalahan pada server FinAI.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kendala yang tidak terduga.';
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${config.apiBaseUrl}${path}`;
  const sessionToken = await getSessionToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-client-type': 'mobile',
    ...(sessionToken && sessionToken.trim().length > 0
      ? { Authorization: `Bearer ${sessionToken.trim()}` }
      : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? config.timeoutMs
  );

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let json: ApiSuccessResponse<T> | ApiErrorResponse | null = null;
    try {
      json = text ? (JSON.parse(text) as ApiSuccessResponse<T> | ApiErrorResponse) : null;
    } catch {
      // Non-JSON response
    }

    if (!response.ok) {
      const errorPayload = json && !json.success ? (json as ApiErrorResponse).error : undefined;
      const code: ErrorCode =
        errorPayload?.code ||
        (response.status === 401
          ? 'UNAUTHORIZED'
          : response.status === 403
          ? 'FORBIDDEN'
          : response.status === 404
          ? 'NOT_FOUND'
          : response.status === 409
          ? 'CONFLICT'
          : response.status === 400
          ? 'VALIDATION_ERROR'
          : 'INTERNAL_ERROR');

      const message = errorPayload?.message || response.statusText || 'Terjadi kesalahan pada server';
      const details = errorPayload?.details;

      // Handle 401 Unauthorized securely
      if (response.status === 401) {
        try {
          await clearSession();
        } catch {}

        if (unauthorizedHandler) {
          try {
            unauthorizedHandler();
          } catch {}
        }
      }

      throw new ApiClientError(response.status, code, message, details);
    }

    if (json && 'success' in json && json.success) {
      return json.data;
    }

    return json as unknown as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiClientError) {
      throw err;
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiClientError(408, 'NETWORK_ERROR', 'Permintaan melebihi batas waktu (timeout).');
    }

    throw new ApiClientError(
      0,
      'NETWORK_ERROR',
      'Gagal terhubung ke server FinAI. Pastikan server backend sedang aktif dan koneksi internet stabil.'
    );
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, 'GET', undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'POST', body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, 'PATCH', body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, 'DELETE', undefined, options),
};

export default apiClient;

