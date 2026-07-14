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
export type PublishedEntryCollection = components['schemas']['PublishedEntryCollection'];

// Assets
export type MarvinAsset = components['schemas']['PublishedAssetRead'];
export type PublishedAssetRead = components['schemas']['PublishedAssetRead'];
export type PublishedEntryAsset = components['schemas']['PublishedEntryAsset'];

// Resources
export type MarvinResource = components['schemas']['PublishedResourceSummary'];
export type PublishedResourceSummary = components['schemas']['PublishedResourceSummary'];
export type PublishedEntryResource = components['schemas']['PublishedEntryResource'];

// Structured attachments (for write API)
export type AssetAttachment = components['schemas']['AssetAttachment'];
export type CollectionAttachment = components['schemas']['CollectionAttachment'];
export type ResourceAttachment = components['schemas']['ResourceAttachment'];

// Rich read types (admin API)
export type EntryCollectionRead = components['schemas']['EntryCollectionRead'];

// Entry Types (admin — kept for backwards compat export)
export type MarvinEntryType = components['schemas']['EntryTypeRead'];

/** Entry-specific relationship data within a collection */
export interface CollectionEntryMetadata {
  role: string | null;
  position: number;
  metadataJson: Record<string, unknown> | null;
}

/** The collection context when an entry is fetched through a specific collection */
export interface CollectionContext {
  slug: string;
  name: string;
  description?: string | null;
  metadataJson?: Record<string, unknown> | null;
  /** This entry's relationship to the collection (role, position, junction metadata) */
  entryMetadata: CollectionEntryMetadata;
}

/**
 * An entry as returned when fetched through a specific collection.
 * - `collection`: the collection you queried through, with its junction context
 * - `collectionSlugs`: slugs of other collections this entry also belongs to
 */
export interface CollectionEntry extends Omit<MarvinEntryListItem, 'collections'> {
  collection: CollectionContext;
  /** All collection slugs this entry belongs to, including the one queried through */
  collectionSlugs: string[];
}

/**
 * A collection membership as it appears on an entry.
 * - `collection`: the collection's own fields (slug, name, description, metadataJson, sortOrder)
 * - `entryMetadata`: the entry's relationship to this collection (role, position, metadataJson)
 */
export interface EntryCollectionContext {
  collection: PublishedCollectionSummary;
  entryMetadata: CollectionEntryMetadata;
}

/**
 * An asset as it appears on an entry — includes the asset's own fields
 * plus `entryMetadata` for the entry's relationship to this asset.
 */
export interface EntryAsset extends PublishedAssetRead {
  entryMetadata: CollectionEntryMetadata;
}

/**
 * A resource as it appears on an entry — includes the resource's own fields
 * plus `entryMetadata` for the entry's relationship to this resource.
 */
export interface EntryResource extends PublishedResourceSummary {
  entryMetadata: CollectionEntryMetadata;
}

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
