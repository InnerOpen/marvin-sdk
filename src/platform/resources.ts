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
    return this.http.get<PlatformResource>(`/api/platform/resources/${id}`);
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
    return this.http.patch<PlatformResource>(`/api/platform/resources/${id}`, data);
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/resources/${id}`);
  }
}
