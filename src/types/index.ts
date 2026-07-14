/**
 * Marvin Publishing Client Types
 *
 * Type aliases from the auto-generated OpenAPI schema.
 * These stay in sync automatically when the schema is regenerated.
 */

import type { components } from '../generated/schema';

// Site
export type MarvinSite = components['schemas']['WorkspaceSiteInfo'];
export type SiteConfiguration = components['schemas']['SiteConfiguration'];
export type WorkspaceInfo = components['schemas']['WorkspaceInfo'];

// Entries
export type MarvinEntry = components['schemas']['PublishedEntryRead'];
export type MarvinEntryListItem = components['schemas']['PublishedEntryListItem'];
export type PublishedEntryType = components['schemas']['PublishedEntryTypeRead'];

// Collections
export type MarvinCollection = components['schemas']['PublishedCollectionRead'];
export type PublishedCollectionSummary = components['schemas']['PublishedCollectionSummary'];

// Assets
export type MarvinAsset = components['schemas']['PublishedAssetRead'];
export type PublishedAssetRead = components['schemas']['PublishedAssetRead'];
export type PublishedEntryAsset = components['schemas']['PublishedEntryAsset'];

// Resources
export type MarvinResource = components['schemas']['PublishedResourceSummary'];
export type PublishedEntryResource = components['schemas']['PublishedEntryResource'];

// Structured attachments (for write API)
export type AssetAttachment = components['schemas']['AssetAttachment'];
export type CollectionAttachment = components['schemas']['CollectionAttachment'];
export type ResourceAttachment = components['schemas']['ResourceAttachment'];

// Rich read types (admin API)
export type EntryCollectionRead = components['schemas']['EntryCollectionRead'];

// Entry Types (admin — kept for backwards compat export)
export type MarvinEntryType = components['schemas']['EntryTypeRead'];

// SDK-only types (not in generated schema)

export interface AssetUploadRequest {
  slug: string;
  name: string;
  altText?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface MarvinPublishResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface MarvinClientConfig {
  apiUrl: string;
  siteClientToken: string;
  workspaceSlug: string;
}

export interface GetEntriesOptions {
  entryType?: string;
  collection?: string;
  limit?: number;
  offset?: number;
  status?: string;
}

export interface GetAssetsOptions {
  type?: string;
  limit?: number;
  offset?: number;
}

export interface GetResourcesOptions {
  resourceType?: string;
  limit?: number;
  offset?: number;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
}
