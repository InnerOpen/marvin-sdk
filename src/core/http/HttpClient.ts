/**
 * Base HTTP client for Marvin APIs
 */

import type { AuthStrategy } from '../auth';
import { MarvinApiError } from '../errors';

export interface HttpClientConfig {
  baseUrl: string;
  auth: AuthStrategy;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
  timeout?: number;
}

export class HttpClient {
  private baseUrl: string;
  private auth: AuthStrategy;
  private defaultHeaders: Record<string, string>;
  private credentials: RequestCredentials;
  private timeout: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.auth = config.auth;
    this.defaultHeaders = config.defaultHeaders || {};
    this.credentials = config.credentials || 'same-origin';
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Build full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove trailing slash from baseUrl and leading slash from endpoint
    const base = this.baseUrl.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${base}/${path}`;
  }

  /**
   * Build headers for request
   */
  private buildHeaders(additionalHeaders?: Record<string, string>, isFormData = false): Headers {
    const headerInit: Record<string, string> = {};

    // Don't set Content-Type for FormData - browser will add multipart boundary
    if (!isFormData) {
      headerInit['Content-Type'] = 'application/json';
    }

    const headers = new Headers({
      ...headerInit,
      ...this.defaultHeaders,
      ...additionalHeaders,
    });

    // Inject authentication
    this.auth.injectAuth(headers);

    return headers;
  }

  /**
   * Build query string from params
   */
  buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

    return filtered.length > 0 ? `?${filtered.join('&')}` : '';
  }

  /**
   * Perform HTTP request
   */
  async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean | undefined>;
    }
  ): Promise<T> {
    const url = this.buildUrl(endpoint) + (options?.params ? this.buildQueryString(options.params) : '');
    const isFormData = options?.body instanceof FormData;
    const headers = this.buildHeaders(options?.headers, isFormData);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: isFormData
          ? (options.body as FormData)
          : (options?.body ? JSON.stringify(options.body) : undefined),
        credentials: this.credentials,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle unauthorized
      if (response.status === 401 && this.auth.handleUnauthorized) {
        await this.auth.handleUnauthorized();
        // Could retry request here, but for now just throw
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw MarvinApiError.fromResponse(
          response.status,
          response.statusText,
          endpoint,
          errorText
        );
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof MarvinApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new MarvinApiError(
            `Request timeout after ${this.timeout}ms`,
            408,
            endpoint
          );
        }
        throw new MarvinApiError(error.message, 0, endpoint);
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('GET', endpoint, { params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, { body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, { body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', endpoint, { body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}
