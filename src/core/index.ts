/**
 * Marvin SDK Core Utilities
 *
 * Shared utilities used across all API modules (publish, platform, admin, auth)
 */

// HTTP Client
export { HttpClient } from './http';
export type { HttpClientConfig } from './http';

// Authentication
export type { AuthStrategy } from './auth';
export { BearerTokenAuth, SessionAuth, NoAuth } from './auth';

// Errors
export {
  MarvinError,
  MarvinApiError,
  MarvinAuthError,
  MarvinConfigError,
  MarvinValidationError,
  MarvinNotFoundError,
  MarvinNetworkError,
  MarvinServerError,
} from './errors';

// Pagination
export type { PaginatedResponse, PaginationMeta, PaginationParams } from './pagination';
export {
  createPaginatedResponse,
  extractData,
  isPaginatedResponse,
  pageToOffset,
  offsetToPage,
} from './pagination';

// Cache
export { MarvinCache } from './cache';

// Validation
export {
  validateEmail,
  validateUrl,
  validateRequired,
  validateStringLength,
  validateNumberRange,
} from './validation';
