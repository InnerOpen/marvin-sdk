/**
 * Email Templates Module - Platform API
 *
 * Manage workspace email templates
 */

import type { HttpClient } from '../core';

// Type definitions
export interface EmailTemplateSummary {
  id: string;
  template_type: string;
  group_id: string | null;
  name: string;
  description?: string;
  enabled: boolean;
  created_at: string;
  update_at: string;
}

export interface EmailTemplateRead extends EmailTemplateSummary {
  subject: string;
  header_text?: string;
  message_top?: string;
  message_bottom?: string;
  button_text?: string;
  custom_html?: string;
  available_variables?: Record<string, string>;
}

export interface EmailTemplateCreate {
  template_type: string;
  group_id?: string;
  name: string;
  description?: string;
  subject: string;
  header_text?: string;
  message_top?: string;
  message_bottom?: string;
  button_text?: string;
  custom_html?: string;
  available_variables?: Record<string, string>;
  enabled?: boolean;
}

export interface EmailTemplateUpdate {
  name?: string;
  description?: string;
  subject?: string;
  header_text?: string;
  message_top?: string;
  message_bottom?: string;
  button_text?: string;
  custom_html?: string;
  available_variables?: Record<string, string>;
  enabled?: boolean;
}

export interface TestEmailRequest {
  recipient_email: string;
}

export interface TestEmailResponse {
  message: string;
}

/**
 * Email Templates API client for workspace-scoped templates
 */
export class EmailTemplatesClient {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all email templates for the workspace
   * @param groupId - Workspace ID
   */
  async list(groupId: string): Promise<EmailTemplateSummary[]> {
    return this.http.get<EmailTemplateSummary[]>(`/groups/${groupId}/email-templates`);
  }

  /**
   * Get a specific email template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   */
  async get(groupId: string, templateId: string): Promise<EmailTemplateRead> {
    return this.http.get<EmailTemplateRead>(`/groups/${groupId}/email-templates/${templateId}`);
  }

  /**
   * Create a new email template
   * @param groupId - Workspace ID
   * @param data - Template data
   */
  async create(groupId: string, data: EmailTemplateCreate): Promise<EmailTemplateRead> {
    return this.http.post<EmailTemplateRead>(`/groups/${groupId}/email-templates`, data);
  }

  /**
   * Update an email template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   * @param data - Updated template data
   */
  async update(groupId: string, templateId: string, data: EmailTemplateUpdate): Promise<EmailTemplateRead> {
    return this.http.patch<EmailTemplateRead>(`/groups/${groupId}/email-templates/${templateId}`, data);
  }

  /**
   * Delete an email template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   */
  async delete(groupId: string, templateId: string): Promise<void> {
    await this.http.delete(`/groups/${groupId}/email-templates/${templateId}`);
  }

  /**
   * Send a test email using a template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   * @param recipientEmail - Test recipient email address
   */
  async sendTest(groupId: string, templateId: string, recipientEmail: string): Promise<TestEmailResponse> {
    return this.http.post<TestEmailResponse>(`/groups/${groupId}/email-templates/${templateId}/test`, {
      recipient_email: recipientEmail,
    });
  }
}
