/**
 * Assets Module - Platform API
 *
 * CRUD operations for assets
 */

import type { HttpClient } from '../core';
import type {
  PlatformAsset,
  PlatformAssetCreate,
  PlatformAssetUpdate,
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
    return this.http.get<PlatformAsset>(`/api/platform/assets/${id}`);
  }

  /**
   * Create a new asset
   */
  async create(data: PlatformAssetCreate): Promise<PlatformAsset> {
    return this.http.post<PlatformAsset>('/api/platform/assets', data);
  }

  /**
   * Update an asset
   */
  async update(id: string, data: PlatformAssetUpdate): Promise<PlatformAsset> {
    return this.http.patch<PlatformAsset>(`/api/platform/assets/${id}`, data);
  }

  /**
   * Delete an asset
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/assets/${id}`);
  }
}
