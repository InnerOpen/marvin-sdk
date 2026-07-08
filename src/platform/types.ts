/**
 * Platform API Types
 *
 * Re-exports types from the auto-generated OpenAPI schema
 * with better naming for public API consumption
 */

import type { components } from '../generated/schema';

/**
 * Entry (Platform API - full CRUD)
 */
export type PlatformEntry = components['schemas']['EntryRead'];
export type PlatformEntryCreate = components['schemas']['EntryCreate'];
export type PlatformEntryUpdate = components['schemas']['EntryUpdate'];

/**
 * Entry Type
 */
export type PlatformEntryType = components['schemas']['EntryTypeRead'];

/**
 * Collection (Platform API - full CRUD)
 */
export type PlatformCollection = components['schemas']['CollectionRead'];
export type PlatformCollectionCreate = components['schemas']['CollectionCreate'];
export type PlatformCollectionUpdate = components['schemas']['CollectionUpdate'];

/**
 * Resource (Platform API - full CRUD)
 */
export type PlatformResource = components['schemas']['ResourceRead'];
export type PlatformResourceCreate = components['schemas']['ResourceCreate'];
export type PlatformResourceUpdate = components['schemas']['ResourceUpdate'];

/**
 * Asset (Platform API - full CRUD with file upload)
 */
export type PlatformAsset = components['schemas']['AssetRead'];
export type PlatformAssetUpdate = components['schemas']['AssetUpdate'];
// AssetUploadRequest not in OpenAPI (used as Form parameters)
export type PlatformAssetUpload = {
  slug: string;
  name: string;
  altText?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

/**
 * API Client (Platform API - manage publishing tokens)
 */
export type PlatformAPIClient = components['schemas']['APIClientRead'];
export type PlatformAPIClientCreate = components['schemas']['APIClientCreate'];
export type PlatformAPIClientUpdate = components['schemas']['APIClientUpdate'];
export type PlatformAPIClientWithToken = components['schemas']['APIClientWithToken'];

/**
 * Workspace Member (Platform API - member management)
 */
export type PlatformWorkspaceMember = components['schemas']['WorkspaceMembershipRead'];
export type PlatformWorkspaceMemberCreate = components['schemas']['WorkspaceMemberCreate'];
export type PlatformWorkspaceMemberUpdate = components['schemas']['WorkspaceMemberUpdate'];

/**
 * Event Log (Platform API - audit trail and event history)
 */
export type EventLogEntry = components['schemas']['EventLogRead'];
export type EventLogSummary = components['schemas']['EventLogSummary'];
