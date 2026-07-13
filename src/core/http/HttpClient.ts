/**
 * Base HTTP client for Marvin APIs
 */

import type { AuthStrategy } from '../auth';
import {
  MarvinApiError,
  MarvinNotFoundError,
  MarvinNetworkError,
  MarvinServerError,
  MarvinAuthError,
  MarvinValidationError
} from '../errors';

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Initial delay in ms before first retry (default: 1000) */
  initialDelay: number;
  /** Maximum delay in ms between retries (default: 10000) */
  maxDelay: number;
  /** HTTP status codes that should trigger a retry (default: [408, 429, 500, 502, 503, 504]) */
  retryableStatuses: number[];
}

export interface HttpClientConfig {
  baseUrl: string;
  auth: AuthStrategy;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
  timeout?: number;
  debug?: boolean;
  retry?: Partial<RetryConfig>;
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
  private retryConfig: RetryConfig;
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

    // Enforce maximum timeout to prevent resource exhaustion
    const MAX_TIMEOUT = 120000; // 2 minutes
    this.timeout = Math.min(config.timeout || 30000, MAX_TIMEOUT);

    this.debug = config.debug ?? false;
    this.logger = config.logger ?? console;

    // Default retry configuration
    this.retryConfig = {
      maxRetries: config.retry?.maxRetries ?? 3,
      initialDelay: config.retry?.initialDelay ?? 1000,
      maxDelay: config.retry?.maxDelay ?? 10000,
      retryableStatuses: config.retry?.retryableStatuses ?? [408, 429, 500, 502, 503, 504],
    };
  }

  /**
   * Validate path parameter to prevent path traversal attacks
   */
  validatePathParam(param: string | number, paramName: string = 'parameter'): string {
    // Allow numbers (converted to string)
    if (typeof param === 'number') {
      return String(param);
    }

    // Validate string parameters
    if (!param || typeof param !== 'string') {
      throw new MarvinValidationError(`Invalid ${paramName}: must be a non-empty string or number`);
    }

    // Prevent path traversal attacks
    if (param.includes('..') || param.includes('/') || param.includes('\\')) {
      throw new MarvinValidationError(
        `Invalid ${paramName}: cannot contain path traversal characters (.. / \\)`
      );
    }

    // Prevent null bytes
    if (param.includes('\0')) {
      throw new MarvinValidationError(`Invalid ${paramName}: cannot contain null bytes`);
    }

    // Reasonable length check (prevent DoS via extremely long IDs)
    if (param.length > 255) {
      throw new MarvinValidationError(`Invalid ${paramName}: exceeds maximum length of 255 characters`);
    }

    return param;
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
   * Sanitize data for logging by redacting sensitive fields
   */
  private sanitizeForLogging(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // List of sensitive field names to redact
    const sensitiveFields = [
      'token',
      'access_token',
      'refresh_token',
      'password',
      'secret',
      'apiKey',
      'api_key',
      'bearer',
      'authorization',
      'csrf_token',
      'session',
      'cookie',
    ];

    const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        const keyLower = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => keyLower.includes(field));

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          sanitized[key] = sanitize(value as Record<string, unknown>);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item =>
            item && typeof item === 'object' ? sanitize(item as Record<string, unknown>) : item
          );
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    };

    if (Array.isArray(data)) {
      return data.map(item =>
        item && typeof item === 'object' ? sanitize(item as Record<string, unknown>) : item
      );
    }

    return sanitize(data as Record<string, unknown>);
  }

  /**
   * Calculate delay for retry with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.initialDelay * Math.pow(2, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Perform HTTP request with automatic retry on transient failures
   */
  async request<T>(
    method: string,
    endpoint: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean | undefined>;
    },
    retryAttempt = 0
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

        // Check if this error is retryable
        const isRetryable = this.retryConfig.retryableStatuses.includes(response.status);
        const canRetry = retryAttempt < this.retryConfig.maxRetries;

        if (isRetryable && canRetry) {
          const delay = this.calculateRetryDelay(retryAttempt);
          if (this.debug) {
            this.logger.warn(
              `[Marvin] Retry ${retryAttempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms (status: ${response.status})`
            );
          }
          await this.sleep(delay);
          return this.request<T>(method, endpoint, options, retryAttempt + 1);
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

      // Log response data in debug mode (sanitized)
      if (this.debug) {
        const sanitized = this.sanitizeForLogging(data);
        this.logger.log('[Marvin] Response:', JSON.stringify(sanitized, null, 2));
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw Marvin errors as-is (they've already been through retry logic)
      if (
        error instanceof MarvinApiError ||
        error instanceof MarvinNotFoundError ||
        error instanceof MarvinAuthError ||
        error instanceof MarvinServerError
      ) {
        throw error;
      }

      // Handle network/timeout errors with retry
      if (error instanceof Error) {
        const canRetry = retryAttempt < this.retryConfig.maxRetries;

        if (canRetry && error.name !== 'AbortError') {
          // Retry on network errors, but not on timeout
          const delay = this.calculateRetryDelay(retryAttempt);
          if (this.debug) {
            this.logger.warn(
              `[Marvin] Retry ${retryAttempt + 1}/${this.retryConfig.maxRetries} after ${delay}ms (network error)`
            );
          }
          await this.sleep(delay);
          return this.request<T>(method, endpoint, options, retryAttempt + 1);
        }

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
