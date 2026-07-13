/**
 * Entry Types Module - Platform API
 */

import type { HttpClient } from '../core';
import type { PlatformEntryType } from './types';
import type { components } from '../generated/schema';

export type EntryTypeCreate = components['schemas']['EntryTypeCreate'];
export type EntryTypeUpdate = components['schemas']['EntryTypeUpdate'];

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

  /**
   * Create a new entry type
   */
  async create(data: EntryTypeCreate): Promise<PlatformEntryType> {
    return this.http.post<PlatformEntryType>('/api/platform/entry-types', data);
  }

  /**
   * Update an entry type
   */
  async update(id: string, data: EntryTypeUpdate): Promise<PlatformEntryType> {
    return this.http.patch<PlatformEntryType>(`/api/platform/entry-types/${id}`, data);
  }

  /**
   * Delete an entry type
   */
  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`/api/platform/entry-types/${id}`);
  }
}
