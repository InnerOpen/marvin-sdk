/**
 * Entry Types Module - Platform API
 *
 * Read-only access to entry types
 */

import type { HttpClient } from '../core';
import type { PlatformEntryType } from './types';

export class EntryTypesModule {
  constructor(private http: HttpClient) {}

  /**
   * List all entry types
   */
  async list(): Promise<PlatformEntryType[]> {
    return this.http.get<PlatformEntryType[]>('/api/platform/entry-types');
  }

  /**
   * Get a single entry type by ID
   */
  async get(id: string): Promise<PlatformEntryType> {
    return this.http.get<PlatformEntryType>(`/api/platform/entry-types/${id}`);
  }
}
