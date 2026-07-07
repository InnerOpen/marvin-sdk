/**
 * Authentication & User Registration
 *
 * Public authentication endpoints (no auth required)
 */

import { HttpClient } from './core';

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export class AuthClient extends HttpClient {
  constructor(apiUrl: string) {
    super({ baseUrl: apiUrl });
  }

  /**
   * Register a new user
   */
  async register(data: UserRegistration): Promise<{ message: string; userId: string }> {
    return this.post<{ message: string; userId: string }>('/api/users/register', data);
  }

  /**
   * Request password reset (sends email with token)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/users/forgot-password', data);
  }

  /**
   * Reset password with token from email
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/users/reset-password', data);
  }
}

/**
 * Create an Auth client for registration and password reset
 */
export function createAuthClient(apiUrl: string): AuthClient {
  return new AuthClient(apiUrl);
}
