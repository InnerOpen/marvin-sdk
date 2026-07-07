/**
 * Platform API Module
 *
 * Workspace content management (CRUD operations)
 */

export { PlatformClient, createPlatformClient } from './client';
export type { PlatformClientConfig } from './client';

// Re-export Platform-specific types
export type {
  // Entries
  PlatformEntry,
  PlatformEntryCreate,
  PlatformEntryUpdate,

  // Collections
  PlatformCollection,
  PlatformCollectionCreate,
  PlatformCollectionUpdate,

  // Resources
  PlatformResource,
  PlatformResourceCreate,
  PlatformResourceUpdate,

  // Assets
  PlatformAsset,
  PlatformAssetCreate,
  PlatformAssetUpdate,

  // API Clients
  PlatformAPIClient,
  PlatformAPIClientCreate,
  PlatformAPIClientUpdate,
  PlatformAPIClientWithToken,

  // Entry Types
  PlatformEntryType,
} from './types';
