/**
 * Authentication & User Registration
 *
 * Public authentication endpoints (no auth required)
 */

import { HttpClient, NoAuth } from './core';

export interface UserRegistration {
  username: string;
  email: string;
  full_name: string;
  password: string;
  password_confirm: string;
  group_token?: string | null;
  group?: string | null;
  advanced?: boolean;
  private?: boolean;
  seed_data?: boolean;
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
   * Returns the created user object
   */
  async register(data: UserRegistration): Promise<any> {
    return this.post<any>('/users/register', data);
  }

  /**
   * Request password reset (sends email with token)
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/users/forgot-password', data);
  }

  /**
   * Reset password with token from email
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.post<{ message: string }>('/users/reset-password', data);
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
