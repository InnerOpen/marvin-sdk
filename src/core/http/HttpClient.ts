/**
 * Base HTTP client for Marvin APIs
 */

import type { AuthStrategy } from '../auth';
import {
  MarvinApiError,
  MarvinNotFoundError,
  MarvinNetworkError,
  MarvinServerError,
  MarvinAuthError
} from '../errors';

export interface HttpClientConfig {
  baseUrl: string;
  auth: AuthStrategy;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
  timeout?: number;
  debug?: boolean;
  logger?: {
    log: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };
}

export class HttpClient {
  private baseUrl: string;
  private auth: AuthStrategy;
  private defaultHeaders: Record<string, string>;
  private credentials: RequestCredentials;
  private timeout: number;
  private debug: boolean;
  private logger: {
    log: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.auth = config.auth;
    this.defaultHeaders = config.defaultHeaders || {};
    this.credentials = config.credentials || 'same-origin';
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.debug = config.debug ?? false;
    this.logger = config.logger ?? console;
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

    const startTime = Date.now();

    if (this.debug) {
      this.logger.log(`[Marvin] ${method} ${url}`);
    }

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

      const duration = Date.now() - startTime;

      if (this.debug) {
        this.logger.log(
          `[Marvin] ${response.status} ${response.statusText} (${duration}ms)`
        );
      }

      // Handle unauthorized
      if (response.status === 401 && this.auth.handleUnauthorized) {
        await this.auth.handleUnauthorized();
        // Could retry request here, but for now just throw
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        if (this.debug) {
          this.logger.error(
            `[Marvin] Error response: ${response.status} ${response.statusText}`,
            errorText ? `Body: ${errorText}` : ''
          );
        }

        // Throw specific error types based on status code
        if (response.status === 404) {
          throw new MarvinNotFoundError(
            `Resource not found: ${endpoint}`,
            endpoint
          );
        }

        if (response.status === 401 || response.status === 403) {
          throw new MarvinAuthError(
            `Authentication failed: ${response.statusText}`,
            response.status
          );
        }

        if (response.status >= 500) {
          throw new MarvinServerError(
            `Server error: ${response.status} ${response.statusText}`,
            response.status,
            endpoint
          );
        }

        // Generic API error for other cases
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

      const data = (await response.json()) as T;

      // Log response data in debug mode
      if (this.debug) {
        this.logger.log('[Marvin] Response:', JSON.stringify(data, null, 2));
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw Marvin errors as-is
      if (
        error instanceof MarvinApiError ||
        error instanceof MarvinNotFoundError ||
        error instanceof MarvinAuthError ||
        error instanceof MarvinServerError
      ) {
        throw error;
      }

      // Handle network/timeout errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new MarvinNetworkError(
            `Request timeout after ${this.timeout}ms`,
            error
          );
        }
        throw new MarvinNetworkError(
          `Network error: ${error.message}`,
          error
        );
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
