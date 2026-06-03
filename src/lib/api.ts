import { tokenStore } from './token-store';
import type { ApiErrorBody } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // default true. Set false for public endpoints.
  headers?: Record<string, string>;
  responseType?: 'json' | 'text';
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(`${API}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method || 'GET';
  const headers: Record<string, string> = { ...(opts.headers || {}) };

  if (opts.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const useAuth = opts.auth !== false;
  if (useAuth) {
    const token = tokenStore.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  if (opts.responseType === 'text') {
    const text = await res.text();
    if (!res.ok) {
      throw new ApiError(res.status, 'HTTP_ERROR', text || res.statusText);
    }
    return text as T;
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (json as ApiErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      err?.code || 'HTTP_ERROR',
      err?.message || res.statusText,
      err?.details,
    );
  }

  // Unwrap { data } if present; otherwise return raw
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as any).data as T;
  }
  return json as T;
}

// Helper for paginated endpoints that return { data, meta }
export async function apiRequestPaginated<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<{ data: T[]; meta: any }> {
  const method = opts.method || 'GET';
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (opts.body !== undefined) headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  const useAuth = opts.auth !== false;
  if (useAuth) {
    const token = tokenStore.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json as ApiErrorBody | null)?.error;
    throw new ApiError(res.status, err?.code || 'HTTP_ERROR', err?.message || res.statusText, err?.details);
  }
  return json as { data: T[]; meta: any };
}

export const API_BASE_URL = API;
