/**
 * Assets Module - Platform API
 *
 * CRUD operations and file upload for assets
 */

import { HttpClient, MarvinValidationError } from '../core';
import type {
  PlatformAsset,
  PlatformAssetUpdate,
  PlatformAssetUpload,
} from './types';

export interface FileUploadOptions {
  /** Maximum file size in bytes (default: 100MB) */
  maxFileSize?: number;
  /** Allowed MIME types (if not provided, all types allowed) */
  allowedMimeTypes?: string[];
}

export class AssetsModule {
  constructor(private http: HttpClient) {}

  /**
   * Validate file before upload
   */
  private validateFile(file: File | Blob, options?: FileUploadOptions): void {
    const maxSize = options?.maxFileSize || 100 * 1024 * 1024; // 100MB default
    const allowedTypes = options?.allowedMimeTypes;

    // Check file size
    if (file.size === 0) {
      throw new MarvinValidationError('File is empty');
    }

    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      const fileMB = Math.round(file.size / (1024 * 1024));
      throw new MarvinValidationError(
        `File size (${fileMB}MB) exceeds maximum allowed size of ${maxMB}MB`
      );
    }

    // Check MIME type if restrictions are specified
    if (allowedTypes && allowedTypes.length > 0) {
      // For File objects, we can check the type
      if (file instanceof File && file.type) {
        const isAllowed = allowedTypes.some(allowed => {
          // Support wildcards like "image/*"
          if (allowed.endsWith('/*')) {
            const prefix = allowed.slice(0, -2);
            return file.type.startsWith(prefix);
          }
          return file.type === allowed;
        });

        if (!isAllowed) {
          throw new MarvinValidationError(
            `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
          );
        }
      }
    }

    // Check for filename if it's a File object
    if (file instanceof File) {
      if (!file.name || file.name.trim().length === 0) {
        throw new MarvinValidationError('File must have a valid name');
      }

      // Basic filename validation (no path traversal)
      if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        throw new MarvinValidationError('Invalid filename: cannot contain path separators');
      }
    }
  }

  /**
   * List all assets
   */
  async list(): Promise<PlatformAsset[]> {
    return this.http.get<PlatformAsset[]>('/api/platform/assets');
  }

  /**
   * Get a single asset by ID
   */
  async get(id: string): Promise<PlatformAsset> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.get<PlatformAsset>(`/api/platform/assets/${validId}`);
  }

  /**
   * Upload a new asset file
   *
   * @param file - The file to upload (File or Blob)
   * @param metadata - Asset metadata (slug, name, altText, description, metadata)
   * @param options - Upload options (file size limits, allowed types)
   * @returns The created asset with extracted metadata
   *
   * @example
   * ```typescript
   * // Upload with default limits (100MB, all types)
   * const asset = await assets.upload(file, { slug: 'my-image', name: 'My Image' });
   *
   * // Upload with restrictions
   * const asset = await assets.upload(file,
   *   { slug: 'avatar', name: 'Avatar' },
   *   { maxFileSize: 5 * 1024 * 1024, allowedMimeTypes: ['image/*'] }
   * );
   * ```
   */
  async upload(
    file: File | Blob,
    metadata: PlatformAssetUpload,
    options?: FileUploadOptions
  ): Promise<PlatformAsset> {
    // Validate file before upload
    this.validateFile(file, options);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('slug', metadata.slug);
    formData.append('name', metadata.name);

    if (metadata.altText) {
      formData.append('alt_text', metadata.altText);
    }

    if (metadata.description) {
      formData.append('description', metadata.description);
    }

    if (metadata.metadata) {
      formData.append('metadata', JSON.stringify(metadata.metadata));
    }

    // Use FormData with POST - HttpClient should handle this properly
    return this.http.post<PlatformAsset>('/api/platform/assets/upload', formData);
  }

  /**
   * Update an asset (editable fields only: slug, name, altText, description, metadata)
   */
  async update(id: string, data: PlatformAssetUpdate): Promise<PlatformAsset> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.patch<PlatformAsset>(`/api/platform/assets/${validId}`, data);
  }

  /**
   * Delete an asset (removes file from storage and database)
   */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'asset ID');
    return this.http.delete(`/api/platform/assets/${validId}`);
  }

  /**
   * Get download URL for an asset file
   * Use this to create download links or fetch the file directly
   */
  getDownloadUrl(id: string, baseUrl?: string): string {
    const validId = this.http.validatePathParam(id, 'asset ID');
    const base = baseUrl || (typeof window !== 'undefined' && window.location ? window.location.origin : '');
    return `${base}/api/platform/assets/${validId}/file`;
  }
}
