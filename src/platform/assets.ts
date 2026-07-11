/**
 * Assets Module - Platform API
 *
 * CRUD operations and file upload for assets
 */

import type { HttpClient } from '../core';
import type {
  PlatformAsset,
  PlatformAssetUpdate,
  PlatformAssetUpload,
} from './types';

export class AssetsModule {
  constructor(private http: HttpClient) {}

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
   * @returns The created asset with extracted metadata
   */
  async upload(
    file: File | Blob,
    metadata: PlatformAssetUpload
  ): Promise<PlatformAsset> {
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
    return this.http.delete(`/api/platform/assets/${id}`);
  }
}
