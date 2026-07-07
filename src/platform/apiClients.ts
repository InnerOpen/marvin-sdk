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
    return this.http.get<PlatformAPIClient>(`/api/platform/api-clients/${id}`);
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
    return this.http.patch<PlatformAPIClient>(`/api/platform/api-clients/${id}`, data);
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
}
