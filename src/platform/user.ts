/**
 * User Self-Service Module - Platform API
 *
 * User profile and personal API token management
 */

import type { HttpClient } from '../core';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  admin: boolean;
}

export interface ApiToken {
  id: string;
  name: string;
  description?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

export interface ApiTokenCreate {
  name: string;
  description?: string | null;
  expiresAt?: string | null;
}

export interface ApiTokenWithToken extends ApiToken {
  token: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  fullName?: string | null;
}

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
