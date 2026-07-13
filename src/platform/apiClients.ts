/**
 * API Clients Module - Platform API
 *
 * Manage publishing API tokens
 */

import type { HttpClient } from '../core';
import type {
  PlatformAPIClient,
  PlatformAPIClientCreate,
  PlatformAPIClientUpdate,
  PlatformAPIClientWithToken,
} from './types';

export class APIClientsModule {
  constructor(private http: HttpClient) {}

  /**
   * List all API clients
   */
  async list(): Promise<PlatformAPIClient[]> {
    return this.http.get<PlatformAPIClient[]>('/api/platform/api-clients');
  }

  /**
   * Get a single API client by ID
   */
  async get(id: string): Promise<PlatformAPIClient> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.get<PlatformAPIClient>(`/api/platform/api-clients/${validId}`);
  }

  /**
   * Create a new API client (returns client with token)
   */
  async create(data: PlatformAPIClientCreate): Promise<PlatformAPIClientWithToken> {
    return this.http.post<PlatformAPIClientWithToken>('/api/platform/api-clients', data);
  }

  /**
   * Update an API client
   */
  async update(id: string, data: PlatformAPIClientUpdate): Promise<PlatformAPIClient> {
    const validId = this.http.validatePathParam(id, 'id');
    return this.http.patch<PlatformAPIClient>(`/api/platform/api-clients/${validId}`, data);
  }

  /**
   * Delete an API client
   */
  async delete(id: string): Promise<void> {
    return this.http.delete(`/api/platform/api-clients/${id}`);
  }

  /**
   * Rotate API client token (generates new token, invalidates old one)
   */
  async rotateToken(id: string): Promise<PlatformAPIClientWithToken> {
    return this.http.post<PlatformAPIClientWithToken>(
      `/api/platform/api-clients/${id}/rotate-token`,
      {}
    );
  }

  /**
   * Preview API client token (show token prefix and metadata without revealing full token)
   */
  async preview(id: string): Promise<PlatformAPIClient> {
    return this.http.get<PlatformAPIClient>(`/api/platform/api-clients/${id}/preview`);
  }
}
