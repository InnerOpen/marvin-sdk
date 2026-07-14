/**
 * Marvin TypeScript SDK
 *
 * The official SDK for integrating with Marvin CMS.
 *
 * @example
 * ```ts
 * import { createMarvinClient } from '@marvin/sdk';
 *
 * const marvin = createMarvinClient();
 *
 * // Workspace-first API
 * const workspace = await marvin.getWorkspace();
 * const entries = await workspace.entries.list();
 *
 * // Convenience API
 * const entry = await marvin.entry('about');
 * const projects = await marvin.projects();
 *
 * // Backwards-compatible API
 * const site = await marvin.getSite();
 * ```
 */

export { MarvinClient } from './client/marvin';
export { createConfigFromEnv } from './client/config';
export type { MarvinConfig } from './client/config';

// Core utilities (for advanced usage and building custom API clients)
export type { HttpClientConfig, AuthStrategy, PaginatedResponse, PaginationMeta, PaginationParams } from './core';
export {
  HttpClient,
  BearerTokenAuth,
  SessionAuth,
  NoAuth,
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

// Types
export type {
  MarvinSite,
  SiteConfiguration,
  WorkspaceInfo,
  MarvinEntry,
  MarvinEntryListItem,
  MarvinEntryType,
  MarvinCollection,
  CollectionEntry,
  CollectionContext,
  CollectionEntryMetadata,
  EntryAsset,
  EntryResource,
  MarvinAsset,
  MarvinResource,
  MarvinPublishResponse,
  PublishedEntryType,
  PublishedCollectionSummary,
  PublishedEntryResource,
  PublishedEntryAsset,
  PublishedAssetRead,
  GetEntriesOptions,
  GetAssetsOptions,
  GetResourcesOptions,
} from './types';

// Workspace & Modules
export { Workspace } from './workspaces/workspace';
export { Entry } from './entries/entry';
export { Collection } from './collections/collection';
export { Resource } from './resources/resource';

// Auth & Registration (public, no auth required)
export { AuthClient, createAuthClient } from './auth';
export type { UserRegistration, ForgotPasswordRequest, ResetPasswordRequest, LoginRequest, AuthToken } from './auth';

/**
 * Create a Marvin client instance from environment variables
 *
 * @param config - Optional configuration overrides
 * @returns Configured Marvin client
 *
 * @example
 * ```ts
 * // From environment variables
 * const marvin = createMarvinClient();
 *
 * // With overrides
 * const marvin = createMarvinClient({
 *   apiUrl: 'https://marvin.example.com',
 *   autoInitialize: true
 * });
 * ```
 */
export function createMarvinClient(config?: Partial<import('./client/config').MarvinConfig>): import('./client/marvin').MarvinClient {
  const { MarvinClient } = require('./client/marvin');
  const { createConfigFromEnv } = require('./client/config');

  const finalConfig = createConfigFromEnv(config);
  return new MarvinClient(finalConfig);
}
