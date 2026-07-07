/**
 * Platform API Types
 *
 * Types for workspace management operations
 */

/**
 * Entry (Platform API - full CRUD)
 */
export interface PlatformEntry {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  contentMarkdown?: string;
  metadata?: Record<string, unknown>;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  groupId: string;

  // Relationships
  entryTypeId: string;
  entryType?: PlatformEntryType;
  collections?: PlatformCollection[];
  assets?: PlatformAsset[];
  resources?: PlatformResource[];
}

export interface PlatformEntryCreate {
  title: string;
  slug: string;
  entryTypeId: string;
  summary?: string;
  description?: string;
  contentMarkdown?: string;
  metadata?: Record<string, unknown>;
  status?: string;
  publishedAt?: string;
}

export interface PlatformEntryUpdate {
  title?: string;
  slug?: string;
  entryTypeId?: string;
  summary?: string;
  description?: string;
  contentMarkdown?: string;
  metadata?: Record<string, unknown>;
  status?: string;
  publishedAt?: string;
}

/**
 * Entry Type
 */
export interface PlatformEntryType {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder: number;
  isSystem: boolean;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection (Platform API - full CRUD)
 */
export interface PlatformCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isSmart: boolean;
  smartRules?: Record<string, unknown>;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformCollectionCreate {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isSmart?: boolean;
  smartRules?: Record<string, unknown>;
}

export interface PlatformCollectionUpdate {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isSmart?: boolean;
  smartRules?: Record<string, unknown>;
}

/**
 * Resource (Platform API - full CRUD)
 */
export interface PlatformResource {
  id: string;
  name: string;
  slug: string;
  resourceType?: string;
  description?: string;
  externalId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformResourceCreate {
  name: string;
  slug: string;
  resourceType?: string;
  description?: string;
  externalId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface PlatformResourceUpdate {
  name?: string;
  slug?: string;
  resourceType?: string;
  description?: string;
  externalId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Asset (Platform API - full CRUD)
 */
export interface PlatformAsset {
  id: string;
  name: string;
  slug: string;
  url: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  focalPoint?: string;
  metadata?: Record<string, unknown>;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAssetCreate {
  name: string;
  slug: string;
  url: string;
  mimeType: string;
  fileSize?: number;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  focalPoint?: string;
  metadata?: Record<string, unknown>;
}

export interface PlatformAssetUpdate {
  name?: string;
  slug?: string;
  url?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  focalPoint?: string;
  metadata?: Record<string, unknown>;
}

/**
 * API Client (Platform API - manage publishing tokens)
 */
export interface PlatformAPIClient {
  id: string;
  name: string;
  description?: string;
  tokenPrefix: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PlatformAPIClientCreate {
  name: string;
  description?: string;
  expiresAt?: string;
}

export interface PlatformAPIClientUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: string;
}

export interface PlatformAPIClientWithToken extends PlatformAPIClient {
  token: string;
}
