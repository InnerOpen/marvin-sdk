/**
 * Publishing API Entry Point
 *
 * Read-only API for published content using site client tokens.
 * Import via: import { createMarvinClient } from '@inneropen/marvin-sdk/publish'
 *
 * @example
 * ```ts
 * import { createMarvinClient } from '@inneropen/marvin-sdk/publish';
 *
 * // Uses MARVIN_SITE_CLIENT_TOKEN from environment
 * const marvin = createMarvinClient();
 *
 * // Or provide token explicitly
 * const marvin = createMarvinClient({
 *   siteClientToken: 'your-token-here'
 * });
 *
 * const entry = await marvin.entry('about');
 * const projects = await marvin.projects();
 * ```
 */

export { MarvinClient } from './client/marvin';
export { createConfigFromEnv } from './client/config';
export type { MarvinConfig } from './client/config';

import type { MarvinConfig as _MarvinConfig } from './client/config';
import { MarvinClient as _MarvinClient } from './client/marvin';

/**
 * Create a Marvin Publishing API client from environment variables
 *
 * @param config - Optional configuration overrides
 * @returns Configured Marvin client for read-only publishing API
 *
 * @example
 * ```ts
 * // From environment variables (MARVIN_SITE_CLIENT_TOKEN)
 * const marvin = createMarvinClient();
 *
 * // With overrides
 * const marvin = createMarvinClient({
 *   apiUrl: 'https://marvin.example.com',
 *   siteClientToken: 'your-token-here'
 * });
 * ```
 */
export function createMarvinClient(config?: Partial<_MarvinConfig>): _MarvinClient {
  const { createConfigFromEnv } = require('./client/config');
  const finalConfig = createConfigFromEnv(config);
  return new _MarvinClient(finalConfig);
}

// Workspace & Modules (read-only)
export { Workspace } from './workspaces/workspace';
export { Entry } from './entries/entry';
export { Collection } from './collections/collection';
export { Resource } from './resources/resource';

// Types
export type {
  MarvinSite,
  MarvinEntry,
  MarvinEntryType,
  MarvinCollection,
  MarvinAsset,
  MarvinResource,
  MarvinPublishResponse,
  PublishedCollectionSummary,
  PublishedResourceRead,
  PublishedAssetRead,
  GetEntriesOptions,
  GetAssetsOptions,
  GetResourcesOptions,
} from './types';

// Core utilities (for advanced usage)
export type { HttpClientConfig, AuthStrategy, PaginatedResponse, PaginationMeta, PaginationParams } from './core';
export {
  HttpClient,
  BearerTokenAuth,
  MarvinError,
  MarvinApiError,
  MarvinAuthError,
  MarvinConfigError,
  MarvinValidationError,
  MarvinNotFoundError,
  MarvinNetworkError,
  MarvinServerError,
  MarvinCache,
  createPaginatedResponse,
  extractData,
  isPaginatedResponse,
  pageToOffset,
  offsetToPage,
} from './core';
