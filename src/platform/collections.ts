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
    return this.http.get<PlatformCollection>(`/api/platform/collections/${id}`);
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
    return this.http.patch<PlatformCollection>(`/api/platform/collections/${id}`, data);
  }

  /**
   * Delete a collection
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/collections/${id}`);
  }

  /**
   * Get entries in a collection
   */
  async getEntries(id: string): Promise<PlatformEntry[]> {
    return this.http.get<PlatformEntry[]>(`/api/platform/collections/${id}/entries`);
  }
}
