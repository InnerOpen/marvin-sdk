/**
 * Pagination response types and helpers
 */

export interface PaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  meta?: PaginationMeta
): PaginatedResponse<T> {
  return { data, meta };
}

/**
 * Extract data from paginated response
 */
export function extractData<T>(response: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  return response.data;
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: PaginatedResponse<T> | T[]
): response is PaginatedResponse<T> {
  return !Array.isArray(response) && 'data' in response;
}

/**
 * Calculate pagination offset from page number
 */
export function pageToOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate page number from offset
 */
export function offsetToPage(offset: number, limit: number): number {
  return Math.floor(offset / limit) + 1;
}
