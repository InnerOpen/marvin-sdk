/**
 * Email Templates SDK - Workspace email template management
 */

import { z } from 'zod';
import type { PlatformClient } from './client';

// Schemas
export const EmailTemplateSummarySchema = z.object({
  id: z.string().uuid(),
  template_type: z.string(),
  group_id: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
  created_at: z.string(),
  update_at: z.string(),
});

export const EmailTemplateReadSchema = EmailTemplateSummarySchema.extend({
  subject: z.string(),
  header_text: z.string().optional(),
  message_top: z.string().optional(),
  message_bottom: z.string().optional(),
  button_text: z.string().optional(),
  custom_html: z.string().optional(),
  available_variables: z.record(z.string()).optional(),
});

export const EmailTemplateCreateSchema = z.object({
  template_type: z.string(),
  group_id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional(),
  subject: z.string(),
  header_text: z.string().optional(),
  message_top: z.string().optional(),
  message_bottom: z.string().optional(),
  button_text: z.string().optional(),
  custom_html: z.string().optional(),
  available_variables: z.record(z.string()).optional(),
  enabled: z.boolean().optional(),
});

export const EmailTemplateUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  header_text: z.string().optional(),
  message_top: z.string().optional(),
  message_bottom: z.string().optional(),
  button_text: z.string().optional(),
  custom_html: z.string().optional(),
  available_variables: z.record(z.string()).optional(),
  enabled: z.boolean().optional(),
});

export const TestEmailRequestSchema = z.object({
  recipient_email: z.string().email(),
});

export const TestEmailResponseSchema = z.object({
  message: z.string(),
});

// Types
export type EmailTemplateSummary = z.infer<typeof EmailTemplateSummarySchema>;
export type EmailTemplateRead = z.infer<typeof EmailTemplateReadSchema>;
export type EmailTemplateCreate = z.infer<typeof EmailTemplateCreateSchema>;
export type EmailTemplateUpdate = z.infer<typeof EmailTemplateUpdateSchema>;
export type TestEmailRequest = z.infer<typeof TestEmailRequestSchema>;
export type TestEmailResponse = z.infer<typeof TestEmailResponseSchema>;

/**
 * Email Templates API client for workspace-scoped templates
 */
export class EmailTemplatesClient {
  constructor(private readonly client: PlatformClient) {}

  /**
   * List all email templates for the workspace
   * @param groupId - Workspace ID
   */
  async list(groupId: string): Promise<EmailTemplateSummary[]> {
    const response = await this.client.get(`/groups/${groupId}/email-templates`);
    return z.array(EmailTemplateSummarySchema).parse(response);
  }

  /**
   * Get a specific email template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   */
  async get(groupId: string, templateId: string): Promise<EmailTemplateRead> {
    const response = await this.client.get(`/groups/${groupId}/email-templates/${templateId}`);
    return EmailTemplateReadSchema.parse(response);
  }

  /**
   * Create a new email template
   * @param groupId - Workspace ID
   * @param data - Template data
   */
  async create(groupId: string, data: EmailTemplateCreate): Promise<EmailTemplateRead> {
    const response = await this.client.post(`/groups/${groupId}/email-templates`, data);
    return EmailTemplateReadSchema.parse(response);
  }

  /**
   * Update an email template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   * @param data - Updated template data
   */
  async update(groupId: string, templateId: string, data: EmailTemplateUpdate): Promise<EmailTemplateRead> {
    const response = await this.client.patch(`/groups/${groupId}/email-templates/${templateId}`, data);
    return EmailTemplateReadSchema.parse(response);
  }

  /**
   * Delete an email template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   */
  async delete(groupId: string, templateId: string): Promise<void> {
    await this.client.delete(`/groups/${groupId}/email-templates/${templateId}`);
  }

  /**
   * Send a test email using a template
   * @param groupId - Workspace ID
   * @param templateId - Template ID
   * @param recipientEmail - Test recipient email address
   */
  async sendTest(groupId: string, templateId: string, recipientEmail: string): Promise<TestEmailResponse> {
    const response = await this.client.post(`/groups/${groupId}/email-templates/${templateId}/test`, {
      recipient_email: recipientEmail,
    });
    return TestEmailResponseSchema.parse(response);
  }
}
