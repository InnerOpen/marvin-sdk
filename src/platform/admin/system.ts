/**
 * Admin System Module - Platform API
 *
 * System information and settings for administrators
 */

import type { HttpClient } from '../../core';
import type { components } from '../../generated/schema';
import type { EmailTemplateSummary, EmailTemplateRead, EmailTemplateUpdate } from '../emailTemplates';

// Type aliases from OpenAPI schema
export type AdminAboutInfo = components['schemas']['AdminAboutInfo'];

/**
 * Email settings returned from API (read-only)
 * Password is never returned for security reasons
 */
export interface EmailSettings {
  host?: string;
  port?: number;
  username?: string;
  from?: string;
  useTls?: boolean;
}

/**
 * Email settings for updates (write-only)
 * Password can be provided to update settings
 */
export interface EmailSettingsUpdate {
  host?: string;
  port?: number;
  username?: string;
  password?: string;  // Only accepted on update, never returned
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

export interface StartupInfo {
  version: string;
  api_port: number;
  api_docs: boolean;
  database_url: string;
  database_provider: string;
  default_group?: string;
  allow_signup: boolean;
  theme?: string;
  custom_middleware?: string[];
  [key: string]: unknown; // Allow additional dynamic properties
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
  async getStartupInfo(): Promise<StartupInfo> {
    return this.http.get<StartupInfo>('/api/admin/about/startup-info');
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
   * Note: Password field is write-only and will not be returned in response
   */
  async updateEmailSettings(data: EmailSettingsUpdate): Promise<EmailSettings> {
    return this.http.put<EmailSettings>('/api/admin/email', data);
  }

  // -----------------------------------------------------------------------
  // Admin email templates
  // -----------------------------------------------------------------------

  /**
   * List all system email templates
   */
  async listEmailTemplates(): Promise<EmailTemplateSummary[]> {
    return this.http.get<EmailTemplateSummary[]>('/api/admin/email/templates');
  }

  /**
   * Get a system email template by ID
   */
  async getEmailTemplate(templateId: string): Promise<EmailTemplateRead> {
    const validId = this.http.validatePathParam(templateId, 'template ID');
    return this.http.get<EmailTemplateRead>(`/api/admin/email/templates/${validId}`);
  }

  /**
   * Update a system email template
   */
  async updateEmailTemplate(templateId: string, data: EmailTemplateUpdate): Promise<EmailTemplateRead> {
    const validId = this.http.validatePathParam(templateId, 'template ID');
    return this.http.patch<EmailTemplateRead>(`/api/admin/email/templates/${validId}`, data);
  }

  /**
   * Send a test email using a system template
   */
  async sendEmailTemplateTest(templateId: string, recipientEmail: string): Promise<{ message: string }> {
    const validId = this.http.validatePathParam(templateId, 'template ID');
    return this.http.post<{ message: string }>(`/api/admin/email/templates/${validId}/test`, {
      recipient_email: recipientEmail,
    });
  }
}
