/**
 * Resources Module - Platform API
 *
 * CRUD operations for resources
 */

import type { HttpClient } from '../core';
import type {
  PlatformResource,
  PlatformResourceCreate,
  PlatformResourceUpdate,
  PlatformEntry,
} from './types';

export class ResourcesModule {
  constructor(private http: HttpClient) {}

  /**
   * List all resources
   */
  async list(): Promise<PlatformResource[]> {
    return this.http.get<PlatformResource[]>('/api/platform/resources');
  }

  /**
   * Get a single resource by ID
   */
  async get(id: string): Promise<PlatformResource> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.get<PlatformResource>(`/api/platform/resources/${validId}`);
  }

  /**
   * Create a new resource
   */
  async create(data: PlatformResourceCreate): Promise<PlatformResource> {
    return this.http.post<PlatformResource>('/api/platform/resources', data);
  }

  /**
   * Update a resource
   */
  async update(id: string, data: PlatformResourceUpdate): Promise<PlatformResource> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.patch<PlatformResource>(`/api/platform/resources/${validId}`, data);
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/resources/${id}`);
  }

  /**
   * Get entries that reference this resource
   */
  async getEntries(id: string): Promise<PlatformEntry[]> {
    return this.http.get<PlatformEntry[]>(`/api/platform/resources/${id}/entries`);
  }

  /**
   * Apply the resource's staged AI suggestion (`suggestionJson`) and clear it. Needs EDITOR.
   */
  async applySuggestion(id: string): Promise<PlatformResource> {
    const validId = this.http.validatePathParam(id, 'resource ID');
    return this.http.post<PlatformResource>(`/api/platform/resources/${validId}/apply-suggestion`, {});
  }

  /**
   * Discard the resource's staged AI suggestion without applying it. Needs EDITOR.
   */
  async rejectSuggestion(id: string): Promise<PlatformResource> {
    const validId = this.http.validatePathParam(id, 'resource ID');
    return this.http.post<PlatformResource>(`/api/platform/resources/${validId}/reject-suggestion`, {});
  }
}
