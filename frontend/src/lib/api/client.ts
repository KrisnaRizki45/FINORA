import type { ApiResponse, ApiErrorResponse, PaginatedResponse } from '@/types';
import { supabase } from '@/lib/supabase/client';

// ──────────────────────────────────────────────
// API Client — Finora
// All requests to Laravel backend go through this client.
// Auth token is automatically injected from Supabase session.
// ──────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the current Supabase JWT token for Authorization header.
   */
  private async getAuthToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  /**
   * Build headers with auth token.
   */
  private async buildHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API response.
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        errors: {},
      }));

      throw new ApiError(
        errorData.message || 'An unexpected error occurred',
        response.status,
        errorData.errors
      );
    }

    return response.json();
  }

  /**
   * GET request.
   */
  async get<T = ApiResponse>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = await this.buildHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request.
   */
  async post<T = ApiResponse>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const headers = await this.buildHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request.
   */
  async put<T = ApiResponse>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const headers = await this.buildHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request.
   */
  async delete<T = ApiResponse>(endpoint: string): Promise<T> {
    const headers = await this.buildHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

/**
 * Custom API error class.
 */
export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Singleton instance
export const api = new ApiClient(`${API_BASE_URL}/v1`);

// Re-export types for convenience
export type { ApiResponse, ApiErrorResponse, PaginatedResponse };
