/**
 * Entry Types Module - Platform API
 */

import type { HttpClient } from '../core';
import type { PlatformEntryType } from './types';

export interface EntryTypeCreate {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  schemaJson?: Record<string, unknown>;
}

export interface EntryTypeUpdate {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  schemaJson?: Record<string, unknown>;
}

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
