/**
 * Collections Module - Platform API
 *
 * CRUD operations for collections
 */

import type { HttpClient } from '../core';
import type {
  PlatformCollection,
  PlatformCollectionCreate,
  PlatformCollectionUpdate,
  PlatformEntry,
} from './types';

export class CollectionsModule {
  constructor(private http: HttpClient) {}

  /**
   * List all collections
   */
  async list(): Promise<PlatformCollection[]> {
    return this.http.get<PlatformCollection[]>('/api/platform/collections');
  }

  /**
   * Get a single collection by ID
   */
  async get(id: string): Promise<PlatformCollection> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.get<PlatformCollection>(`/api/platform/collections/${validId}`);
  }

  /**
   * Create a new collection
   */
  async create(data: PlatformCollectionCreate): Promise<PlatformCollection> {
    return this.http.post<PlatformCollection>('/api/platform/collections', data);
  }

  /**
   * Update a collection
   */
  async update(id: string, data: PlatformCollectionUpdate): Promise<PlatformCollection> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.patch<PlatformCollection>(`/api/platform/collections/${validId}`, data);
  }

  /**
   * Delete a collection
   */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'collection ID');
    return this.http.delete(`/api/platform/collections/${validId}`);
  }

  /**
   * Get entries in a collection
   */
  async getEntries(id: string): Promise<PlatformEntry[]> {
    const validId = this.http.validatePathParam(id, 'collection ID');
    return this.http.get<PlatformEntry[]>(`/api/platform/collections/${validId}/entries`);
  }

  /**
   * Reorder entries in a collection
   */
  async reorderEntries(
    id: string,
    entries: Array<{ entryId: string; sortOrder: number }>
  ): Promise<void> {
    const validId = this.http.validatePathParam(id, 'collection ID');
    return this.http.patch(`/api/platform/collections/${validId}/entries/order`, { entries });
  }
}
