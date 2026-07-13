/**
 * Marvin Publishing Client Types
 *
 * TypeScript types for the Marvin publishing API responses.
 */

export interface MarvinSite {
  id: string;
  name: string;
  slug: string;
  title?: string;
  tagline?: string;
  description?: string;
  canonicalUrl?: string;
  logo?: string;
  favicon?: string;
  locale?: string;
  timezone?: string;
  metadata?: Record<string, unknown>;
}

export interface MarvinEntryType {
  id: string;
  groupId: string | null;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  sortOrder: number;
  isSystem: boolean;
  isRendered: boolean;
  schemaJson?: Record<string, unknown> | null;
  renderingJson?: Record<string, unknown> | null;
  capabilitiesJson?: Record<string, unknown> | null;
  createdAt?: string | null;
  updateAt?: string | null;
  warnings?: string[] | null;
}

export interface MarvinAsset {
  id: string;
  slug: string;
  name: string;
  originalFilename: string;
  filename: string;
  extension: string;
  mimeType: string;
  assetType: 'image' | 'document' | 'video' | 'audio' | 'archive' | 'svg' | 'other';
  fileSize: number;
  checksum: string;
  width?: number;
  height?: number;
  orientation?: number;
  storageProvider: string;
  storageKey: string;
  publicUrl?: string;
  altText?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedAsset {
  slug: string;
  name: string;
  mimeType: string;
  assetType: string;
  fileSize: number;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  publicUrl: string;
}

export interface AssetUploadRequest {
  slug: string;
  name: string;
  altText?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface MarvinCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isSmart: boolean;
  smartRules?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
  entries?: MarvinEntry[];
}

export interface MarvinResource {
  id: string;
  name: string;
  slug: string;
  resourceType?: string;
  description?: string;
  externalId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedCollectionSummary {
  slug: string;
  name: string;
  metadataJson?: Record<string, unknown> | null;
  sortOrder: number;
}

export interface PublishedResourceRead {
  slug: string;
  name: string;
  resourceType: string;
  description?: string | null;
  url?: string | null;
  externalId?: string | null;
  metadataJson?: Record<string, unknown> | null;
  role?: string | null;
  quantity?: string | null;
  unit?: string | null;
  position: number;
}

export interface PublishedAssetRead {
  slug: string;
  name: string;
  mimeType: string;
  assetType: string;
  fileSize: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  description?: string | null;
  publicUrl: string;
  metadataJson?: Record<string, unknown> | null;
}

export interface MarvinEntry {
  slug: string;
  title: string;
  entryType: string;
  entryTypeInfo?: {
    slug: string;
    renderer?: string | null;
    package?: string | null;
    version?: string | null;
    config?: Record<string, unknown> | null;
    publishable: boolean;
    submittable: boolean;
    routable: boolean;
  } | null;
  summary?: string | null;
  data: Record<string, unknown>;
  publishedAt?: string | null;
  metadataJson?: Record<string, unknown> | null;
  collections: PublishedCollectionSummary[];
  resources: PublishedResourceRead[];
  assets: PublishedAssetRead[];
  order?: number | null;
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

export interface PublishedEntryType {
  slug: string;
  name: string;
  isRendered: boolean;
  rendering?: {
    renderer?: string;
    package?: string;
    version?: string;
    config?: Record<string, unknown>;
  };
  capabilities?: {
    publishable: boolean;
    submittable: boolean;
    routable: boolean;
  } | null;
}

export interface GetResourcesOptions {
  resourceType?: string;
  limit?: number;
  offset?: number;
}

/**
 * Authentication token response
 * Used by auth.login() and auth.refresh()
 */
export interface AuthToken {
  accessToken: string;
  tokenType: string;
}
