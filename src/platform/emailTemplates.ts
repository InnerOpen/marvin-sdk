/**
 * Email Templates Module - Platform API
 *
 * Manage workspace email templates
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

export type EmailTemplateSummary = components['schemas']['EmailTemplateSummary'];
export type EmailTemplateRead = components['schemas']['EmailTemplateRead'];
export type EmailTemplateCreate = components['schemas']['EmailTemplateCreate'];
export type EmailTemplateUpdate = components['schemas']['EmailTemplateUpdate'];
export type TestEmailRequest = components['schemas']['EmailTest'];

/**
 * Email Templates API client for workspace-scoped templates
 */
export class EmailTemplatesClient {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all email templates for the workspace
   */
  async list(groupId: string): Promise<EmailTemplateSummary[]> {
    return this.http.get<EmailTemplateSummary[]>(`/api/platform/workspaces/${groupId}/email-templates`);
  }

  /**
   * Get a specific email template
   */
  async get(groupId: string, templateId: string): Promise<EmailTemplateRead> {
    return this.http.get<EmailTemplateRead>(`/api/platform/workspaces/${groupId}/email-templates/${templateId}`);
  }

  /**
   * Create a new email template
   */
  async create(groupId: string, data: EmailTemplateCreate): Promise<EmailTemplateRead> {
    return this.http.post<EmailTemplateRead>(`/api/platform/workspaces/${groupId}/email-templates`, data);
  }

  /**
   * Update an email template
   */
  async update(groupId: string, templateId: string, data: EmailTemplateUpdate): Promise<EmailTemplateRead> {
    return this.http.patch<EmailTemplateRead>(`/api/platform/workspaces/${groupId}/email-templates/${templateId}`, data);
  }

  /**
   * Delete an email template
   */
  async delete(groupId: string, templateId: string): Promise<void> {
    await this.http.delete(`/api/platform/workspaces/${groupId}/email-templates/${templateId}`);
  }

  /**
   * Send a test email using a template
   */
  async sendTest(groupId: string, templateId: string, recipientEmail: string): Promise<{ message: string }> {
    return this.http.post<{ message: string }>(`/api/platform/workspaces/${groupId}/email-templates/${templateId}/test`, {
      email: recipientEmail,
    });
  }

  // -----------------------------------------------------------------------
  // Platform-level email endpoints (no workspace scoping)
  // -----------------------------------------------------------------------

  /**
   * Get template variable info for a given template type
   */
  async getTemplateVars(templateType: string): Promise<unknown> {
    return this.http.get<unknown>(`/api/platform/email/template-vars`, { template_type: templateType });
  }

  /**
   * Get a system email template by ID
   */
  async getSystemTemplate(templateId: string): Promise<EmailTemplateRead> {
    const validId = this.http.validatePathParam(templateId, 'template ID');
    return this.http.get<EmailTemplateRead>(`/api/platform/email/templates/${validId}`);
  }

  /**
   * Update a system email template
   */
  async updateSystemTemplate(templateId: string, data: EmailTemplateUpdate): Promise<EmailTemplateRead> {
    const validId = this.http.validatePathParam(templateId, 'template ID');
    return this.http.patch<EmailTemplateRead>(`/api/platform/email/templates/${validId}`, data);
  }

  /**
   * Send a test email using a system template
   */
  async sendSystemTemplateTest(templateId: string, recipientEmail: string): Promise<{ message: string }> {
    const validId = this.http.validatePathParam(templateId, 'template ID');
    return this.http.post<{ message: string }>(`/api/platform/email/templates/${validId}/test`, {
      recipient_email: recipientEmail,
    });
  }

  /**
   * Test SMTP configuration by sending a test email
   */
  async testSmtp(email: string): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/api/platform/email/test', { email });
  }
}
