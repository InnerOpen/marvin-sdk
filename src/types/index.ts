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
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder: number;
  isSystem: boolean;
  /**
   * Schema definition for this entry type (schema-driven content model).
   * Defines what fields exist, their types, and validation rules.
   * @since 2.0.0
   */
  schemaJson?: Record<string, unknown>;
  rendering?: {
    renderer?: string;
    package?: string;
    version?: string;
    config?: Record<string, unknown>;
  };
  capabilities?: {
    publishable?: boolean;
    submittable?: boolean;
    routable?: boolean;
  };
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

export interface MarvinEntry {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  /**
   * Schema-driven content data structured according to entry type's schemaJson.
   * @since 2.0.0
   */
  dataJson?: Record<string, unknown>;
  /**
   * @deprecated Use dataJson instead. Will be removed in v3.0.0
   * @since 1.x
   */
  contentMarkdown?: string;
  /**
   * Custom non-schema metadata (API keys, external IDs, CMS-specific config).
   * For content fields, use dataJson instead.
   */
  metadata?: Record<string, unknown>;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;

  entryTypeInfo?: {
    slug: string;
    renderer?: string;
    package?: string;
    version?: string;
    config?: Record<string, unknown>;
    publishable?: boolean;
    submittable?: boolean;
    routable?: boolean;
  };

  // Relationships
  entryTypeId: string;
  entryType?: MarvinEntryType;
  collections?: MarvinCollection[];
  assets?: MarvinAsset[];
  resources?: MarvinResource[];
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
  rendering?: {
    renderer?: string;
    package?: string;
    version?: string;
    config?: Record<string, unknown>;
  };
  capabilities?: {
    publishable?: boolean;
    submittable?: boolean;
    routable?: boolean;
  };
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
