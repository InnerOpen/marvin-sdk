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
  SmartCollectionRules,
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
   * Create a **smart collection** whose membership is derived from `rules` and materialized
   * server-side on entry changes (published/updated/…). You don't add entries to it — the
   * server keeps membership in sync. Pass extra fields (description, icon, …) via `extra`.
   */
  async createSmart(
    name: string,
    rules: SmartCollectionRules,
    extra?: Partial<PlatformCollectionCreate>
  ): Promise<PlatformCollection> {
    return this.create({
      ...(extra ?? {}),
      name,
      isSmart: true,
      smartRules: rules,
    } as PlatformCollectionCreate);
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
   * Bulk-reorder collections by setting each one's sortOrder. Works for system collections
   * too (reordering is display-only). Pass the collections in the desired order with ascending
   * sortOrder values.
   */
  async reorder(order: Array<{ id: string; sortOrder: number }>): Promise<{ updated: number }> {
    return this.http.patch<{ updated: number }>('/api/platform/collections/order', {
      collections: order,
    });
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

  /**
   * Get a single entry within a collection by entry ID
   */
  async getEntry(collectionId: string, entryId: string): Promise<unknown> {
    const validCollectionId = this.http.validatePathParam(collectionId, 'collection ID');
    const validEntryId = this.http.validatePathParam(entryId, 'entry ID');
    return this.http.get<unknown>(`/api/platform/collections/${validCollectionId}/entries/${validEntryId}`);
  }

  /**
   * Update junction fields (role, metadata) for an entry in a collection
   */
  async updateEntryJunction(
    collectionId: string,
    entryId: string,
    data: { role?: string | null; metadataJson?: Record<string, unknown> | null }
  ): Promise<void> {
    const validCollectionId = this.http.validatePathParam(collectionId, 'collection ID');
    const validEntryId = this.http.validatePathParam(entryId, 'entry ID');
    return this.http.patch(
      `/api/platform/collections/${validCollectionId}/entries/${validEntryId}`,
      data
    );
  }
}
