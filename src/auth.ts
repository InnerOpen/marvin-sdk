/**
 * Authentication & User Registration
 *
 * Public authentication endpoints (no auth required)
 */

import { HttpClient, NoAuth } from './core';

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: string;
}

export class AuthClient extends HttpClient {
  constructor(apiUrl: string) {
    super({ baseUrl: apiUrl, auth: new NoAuth() });
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

  /**
   * Login with username and password
   * Returns access token for authenticated requests
   */
  async login(data: LoginRequest): Promise<AuthToken> {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await this.request<{ access_token: string; token_type: string }>(
      'POST',
      '/api/auth/token',
      {
        body: formData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return {
      accessToken: response.access_token,
      tokenType: response.token_type,
    };
  }
}

/**
 * Create an Auth client for registration and password reset
 */
export function createAuthClient(apiUrl: string): AuthClient {
  return new AuthClient(apiUrl);
}
