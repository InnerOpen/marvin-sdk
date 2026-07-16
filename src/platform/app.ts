/**
 * App Module - Platform API
 *
 * Application info and health endpoints (unauthenticated)
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

export type LoginInfo = components['schemas']['LoginInfo'];

export interface AppAboutInfo {
  [key: string]: unknown;
}

export class AppModule {
  constructor(private http: HttpClient) {}

  /**
   * Get application about information
   */
  async getAbout(): Promise<AppAboutInfo> {
    return this.http.get<AppAboutInfo>('/api/app/about');
  }

  /**
   * Get application startup information
   */
  async getStartupInfo(): Promise<AppAboutInfo> {
    return this.http.get<AppAboutInfo>('/api/app/about/startup-info');
  }

  /**
   * Get login page configuration (public — no auth required)
   */
  async getLoginInfo(): Promise<LoginInfo> {
    return this.http.get<LoginInfo>('/api/app/about/login-info');
  }

  /**
   * Clear application cache
   */
  async clearCache(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>('/api/app/about/clear-cache', {});
  }

  /**
   * Check application health
   */
  async health(): Promise<unknown> {
    return this.http.get<unknown>('/api/app/health');
  }
}
