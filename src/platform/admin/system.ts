/**
 * Admin System Module - Platform API
 *
 * System information and settings for administrators
 */

import type { HttpClient } from '../../core';
import type { components } from '../../generated/schema';

// Type aliases from OpenAPI schema
export type AdminAboutInfo = components['schemas']['AdminAboutInfo'];

export interface EmailSettings {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  from?: string;
  useTls?: boolean;
}

export interface SystemStatistics {
  users?: number;
  workspaces?: number;
  entries?: number;
  collections?: number;
  resources?: number;
  assets?: number;
}

export class AdminSystemModule {
  constructor(private http: HttpClient) {}

  /**
   * Get system information
   */
  async getAbout(): Promise<AdminAboutInfo> {
    return this.http.get<AdminAboutInfo>('/api/admin/about');
  }

  /**
   * Check system health
   */
  async check(): Promise<{ status: string }> {
    return this.http.get<{ status: string }>('/api/admin/about/check');
  }

  /**
   * Get startup information
   */
  async getStartupInfo(): Promise<any> {
    return this.http.get<any>('/api/admin/about/startup-info');
  }

  /**
   * Get system statistics
   */
  async getStatistics(): Promise<SystemStatistics> {
    return this.http.get<SystemStatistics>('/api/admin/about/statistics');
  }

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<EmailSettings> {
    return this.http.get<EmailSettings>('/api/admin/email');
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(data: EmailSettings): Promise<EmailSettings> {
    return this.http.put<EmailSettings>('/api/admin/email', data);
  }
}
