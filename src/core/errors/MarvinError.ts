/**
 * Base error class for all Marvin SDK errors
 */
export class MarvinError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'MarvinError';
    Object.setPrototypeOf(this, MarvinError.prototype);
  }
}

/**
 * HTTP/API request errors
 */
export class MarvinApiError extends MarvinError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly responseBody?: string
  ) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'MarvinApiError';
    Object.setPrototypeOf(this, MarvinApiError.prototype);
  }

  static fromResponse(
    status: number,
    statusText: string,
    endpoint: string,
    body?: string
  ): MarvinApiError {
    const message = `Marvin API error: ${status} ${statusText} at ${endpoint}${body ? `\n${body}` : ''}`;
    return new MarvinApiError(message, status, endpoint, body);
  }
}

/**
 * Authentication/authorization errors
 */
export class MarvinAuthError extends MarvinError {
  constructor(message: string, statusCode?: number) {
    super(message, 'AUTH_ERROR', statusCode);
    this.name = 'MarvinAuthError';
    Object.setPrototypeOf(this, MarvinAuthError.prototype);
  }
}

/**
 * Configuration errors
 */
export class MarvinConfigError extends MarvinError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'MarvinConfigError';
    Object.setPrototypeOf(this, MarvinConfigError.prototype);
  }
}

/**
 * Validation errors
 */
export class MarvinValidationError extends MarvinError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'MarvinValidationError';
    Object.setPrototypeOf(this, MarvinValidationError.prototype);
  }
}

/**
 * Resource not found errors (404)
 */
export class MarvinNotFoundError extends MarvinError {
  constructor(
    message: string,
    public readonly endpoint: string
  ) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'MarvinNotFoundError';
    Object.setPrototypeOf(this, MarvinNotFoundError.prototype);
  }
}

/**
 * Network/connectivity errors
 */
export class MarvinNetworkError extends MarvinError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message, 'NETWORK_ERROR');
    this.name = 'MarvinNetworkError';
    Object.setPrototypeOf(this, MarvinNetworkError.prototype);
  }
}

/**
 * Server errors (5xx)
 */
export class MarvinServerError extends MarvinError {
  constructor(
    message: string,
    statusCode: number,
    public readonly endpoint: string
  ) {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'MarvinServerError';
    Object.setPrototypeOf(this, MarvinServerError.prototype);
  }
}
