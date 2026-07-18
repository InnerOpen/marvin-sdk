/**
 * User Self-Service Module - Platform API
 *
 * User profile and personal API token management
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

export type UserProfile = components['schemas']['UserRead'];
export type UserProfileUpdate = components['schemas']['UserUpdate'];
export type ApiToken = components['schemas']['LongLiveTokenRead'];
export type ApiTokenCreate = components['schemas']['LongLiveTokenCreate'];
export type ApiTokenWithToken = components['schemas']['LongLiveTokenWithToken'];
export type ApiTokenUpdate = components['schemas']['LongLiveTokenUpdate'];
export type PasswordChange = components['schemas']['ChangePassword'];

export class UserModule {
  constructor(private http: HttpClient) {}

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    return this.http.get<UserProfile>('/api/self');
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UserProfileUpdate): Promise<void> {
    await this.http.put<void>('/api/self', data);
  }

  /**
   * List personal API tokens
   */
  async listApiTokens(): Promise<ApiToken[]> {
    return this.http.get<ApiToken[]>('/api/self/api-tokens');
  }

  /**
   * Create a new personal API token
   */
  async createApiToken(data: ApiTokenCreate): Promise<ApiTokenWithToken> {
    return this.http.post<ApiTokenWithToken>('/api/self/api-tokens', data);
  }

  /**
   * Get a single personal API token by ID
   */
  async getApiToken(tokenId: string): Promise<ApiToken> {
    const validId = this.http.validatePathParam(tokenId, 'token ID');
    return this.http.get<ApiToken>(`/api/self/api-tokens/${validId}`);
  }

  /**
   * Update a personal API token
   */
  async updateApiToken(tokenId: string, data: ApiTokenUpdate): Promise<ApiToken> {
    const validId = this.http.validatePathParam(tokenId, 'token ID');
    return this.http.patch<ApiToken>(`/api/self/api-tokens/${validId}`, data);
  }

  /**
   * Revoke an API token
   */
  async revokeApiToken(tokenId: string): Promise<void> {
    await this.http.post<void>(`/api/self/api-tokens/${tokenId}/revoke`, {});
  }

  /**
   * Rotate an API token (revoke old, create new)
   */
  async rotateApiToken(tokenId: string): Promise<ApiTokenWithToken> {
    return this.http.post<ApiTokenWithToken>(`/api/self/api-tokens/${tokenId}/rotate`, {});
  }

  /**
   * Delete an API token
   */
  async deleteApiToken(tokenId: string): Promise<void> {
    await this.http.delete<void>(`/api/self/api-tokens/${tokenId}`);
  }

  /**
   * Change password
   */
  async changePassword(data: PasswordChange): Promise<void> {
    await this.http.put<void>('/api/self/password', data);
  }
}
