/**
 * Entries Module - Platform API
 *
 * CRUD operations for entries
 */

import type { HttpClient } from '../core';
import type {
  PlatformEntry,
  PlatformEntryCreate,
  PlatformEntryUpdate,
  PlatformCollection,
} from './types';

export class EntriesModule {
  constructor(private http: HttpClient) {}

  /**
   * List all entries
   */
  async list(): Promise<PlatformEntry[]> {
    return this.http.get<PlatformEntry[]>('/api/platform/entries');
  }

  /**
   * Get a single entry by ID
   */
  async get(id: string): Promise<PlatformEntry> {
    return this.http.get<PlatformEntry>(`/api/platform/entries/${id}`);
  }

  /**
   * Create a new entry
   */
  async create(data: PlatformEntryCreate): Promise<PlatformEntry> {
    return this.http.post<PlatformEntry>('/api/platform/entries', data);
  }

  /**
   * Update an entry
   */
  async update(id: string, data: PlatformEntryUpdate): Promise<PlatformEntry> {
    return this.http.patch<PlatformEntry>(`/api/platform/entries/${id}`, data);
  }

  /**
   * Delete an entry
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/entries/${id}`);
  }

  /**
   * Get collections that this entry belongs to
   */
  async listCollections(entryId: string): Promise<PlatformCollection[]> {
    return this.http.get<PlatformCollection[]>(`/api/platform/entries/${entryId}/collections`);
  }

  /**
   * Add entry to a collection
   */
  async addToCollection(entryId: string, collectionId: string): Promise<{ message: string }> {
    return this.http.post<{ message: string }>(
      `/api/platform/entries/${entryId}/collections/${collectionId}`,
      {}
    );
  }

  /**
   * Remove entry from a collection
   */
  async removeFromCollection(entryId: string, collectionId: string): Promise<void> {
    return this.http.delete(`/api/platform/entries/${entryId}/collections/${collectionId}`);
  }
}
