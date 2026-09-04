export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function mapApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return 'Session kamu sudah berakhir. Silakan login kembali.';
    }
    if (error.code === 'INSUFFICIENT_BALANCE' || error.message.toLowerCase().includes('saldo')) {
      return 'Saldo dompet tidak mencukupi.';
    }
    if (error.status === 404) {
      return 'Data tidak ditemukan atau bukan milik Anda.';
    }
    if (error.status === 400) {
      return error.message || 'Data yang dimasukkan tidak valid.';
    }
    if (error.status === 409) {
      return error.message || 'Operasi tidak dapat dilakukan karena konflik data.';
    }
    return error.message || 'Terjadi kesalahan pada server.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan tidak terduga.';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const errorPayload = json?.error as ApiErrorPayload | undefined;
    const code = errorPayload?.code || 'UNKNOWN_ERROR';
    const message = errorPayload?.message || response.statusText || 'Terjadi kesalahan pada server';
    const details = errorPayload?.details;

    if (response.status === 401 && typeof window !== 'undefined') {
      // Handle redirect to login on 401 if on client
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }

    throw new ApiClientError(response.status, code, message, details);
  }

  return json?.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
