/**
 * Auth Module - Platform API
 *
 * Authenticated session management (logout, refresh)
 */

import type { HttpClient } from '../core';
import type { AuthToken } from '../types';

export class AuthModule {
  constructor(private http: HttpClient) {}

  /**
   * Refresh access token
   */
  async refresh(): Promise<AuthToken> {
    const response = await this.http.get<{ access_token: string; token_type: string }>('/api/auth/refresh');

    return {
      accessToken: response.access_token,
      tokenType: response.token_type,
    };
  }

  /**
   * Logout current user (clears session)
   */
  async logout(): Promise<void> {
    await this.http.post<void>('/api/auth/logout', {});
  }
}
