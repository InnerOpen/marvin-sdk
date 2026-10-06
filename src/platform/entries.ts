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
  PlatformEntryCounts,
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
   * Entry counts by status, zero-filled, plus `total` (what the sidebar's inbox badge reads).
   */
  async counts(): Promise<PlatformEntryCounts> {
    return this.http.get<PlatformEntryCounts>('/api/platform/entries/counts');
  }

  /**
   * Get a single entry by ID
   */
  async get(id: string): Promise<PlatformEntry> {
    const validId = this.http.validatePathParam(id, 'entry ID');
    return this.http.get<PlatformEntry>(`/api/platform/entries/${validId}`);
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
    const validId = this.http.validatePathParam(id, 'entry ID');
    return this.http.patch<PlatformEntry>(`/api/platform/entries/${validId}`, data);
  }

  /**
   * Delete an entry
   */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'entry ID');
    return this.http.delete(`/api/platform/entries/${validId}`);
  }

  /**
   * Get collections that this entry belongs to
   */
  async listCollections(entryId: string): Promise<PlatformCollection[]> {
    const validId = this.http.validatePathParam(entryId, 'entry ID');
    return this.http.get<PlatformCollection[]>(`/api/platform/entries/${validId}/collections`);
  }

  /**
   * Add entry to a collection
   */
  async addToCollection(entryId: string, collectionId: string): Promise<{ message: string }> {
    const validEntryId = this.http.validatePathParam(entryId, 'entry ID');
    const validCollectionId = this.http.validatePathParam(collectionId, 'collection ID');
    return this.http.post<{ message: string }>(
      `/api/platform/entries/${validEntryId}/collections/${validCollectionId}`,
      {}
    );
  }

  /**
   * Remove entry from a collection
   */
  async removeFromCollection(entryId: string, collectionId: string): Promise<void> {
    const validEntryId = this.http.validatePathParam(entryId, 'entry ID');
    const validCollectionId = this.http.validatePathParam(collectionId, 'collection ID');
    return this.http.delete(`/api/platform/entries/${validEntryId}/collections/${validCollectionId}`);
  }

  /**
   * Apply the entry's staged AI suggestion (`suggestionJson`) and clear it — the approval half of
   * AI write-back. Returns the updated entry.
   */
  async applySuggestion(id: string): Promise<PlatformEntry> {
    const validId = this.http.validatePathParam(id, 'entry ID');
    return this.http.post<PlatformEntry>(`/api/platform/entries/${validId}/apply-suggestion`, {});
  }

  /**
   * Discard the entry's staged AI suggestion without applying it.
   */
  async rejectSuggestion(id: string): Promise<PlatformEntry> {
    const validId = this.http.validatePathParam(id, 'entry ID');
    return this.http.post<PlatformEntry>(`/api/platform/entries/${validId}/reject-suggestion`, {});
  }

  /**
   * Approve an AI-suggested asset on an entry: it becomes a normal attached asset (and reaches
   * published output).
   */
  async approveSuggestedAsset(entryId: string, assetId: string): Promise<PlatformEntry> {
    const e = this.http.validatePathParam(entryId, 'entry ID');
    const a = this.http.validatePathParam(assetId, 'asset ID');
    return this.http.post<PlatformEntry>(`/api/platform/entries/${e}/suggested-assets/${a}/approve`, {});
  }

  /**
   * Reject an AI-suggested asset: unlink it, and delete the asset if nothing else uses it.
   */
  async rejectSuggestedAsset(entryId: string, assetId: string): Promise<PlatformEntry> {
    const e = this.http.validatePathParam(entryId, 'entry ID');
    const a = this.http.validatePathParam(assetId, 'asset ID');
    return this.http.post<PlatformEntry>(`/api/platform/entries/${e}/suggested-assets/${a}/reject`, {});
  }
}
