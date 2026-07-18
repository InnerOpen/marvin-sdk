/**
 * Admin Users Module - Platform API
 *
 * User management for administrators
 */

import type { HttpClient } from '../../core';
import type { components } from '../../generated/schema';

// Type aliases from OpenAPI schema
export type User = components['schemas']['UserRead'];
export type UserCreate = components['schemas']['UserCreate'];
export type UserUpdate = components['schemas']['UserUpdate'];
export type UserPagination = components['schemas']['UserPagination'];
export type UserSummary = components['schemas']['UserSummary'];

export interface PasswordResetTokenRequest {
  userId: string;
}

export interface PasswordResetTokenResponse {
  token: string;
}

export interface UnlockUserRequest {
  userId: string;
}

export class AdminUsersModule {
  constructor(private http: HttpClient) {}

  /**
   * List all users (paginated)
   */
  async list(page: number = 1, perPage: number = 50): Promise<UserPagination> {
    return this.http.get<UserPagination>(`/api/admin/users?page=${page}&per_page=${perPage}`);
  }

  /**
   * Create a new user
   */
  async create(data: UserCreate): Promise<User> {
    return this.http.post<User>('/api/admin/users', data);
  }

  /**
   * Get a user by ID
   */
  async get(id: string): Promise<User> {
    return this.http.get<User>(`/api/admin/users/${id}`);
  }

  /**
   * Update a user
   */
  async update(id: string, data: UserUpdate): Promise<User> {
    return this.http.put<User>(`/api/admin/users/${id}`, data);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    await this.http.delete<void>(`/api/admin/users/${id}`);
  }

  /**
   * Generate a password reset token for a user
   */
  async generatePasswordResetToken(userId: string): Promise<PasswordResetTokenResponse> {
    return this.http.post<PasswordResetTokenResponse>('/api/admin/users/password-reset-token', { userId });
  }

  /**
   * Unlock a locked user account
   */
  async unlock(userId: string): Promise<void> {
    await this.http.post<void>('/api/admin/users/unlock', { userId });
  }
}
