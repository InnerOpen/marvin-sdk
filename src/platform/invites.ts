/**
 * Invites Module - Platform API
 *
 * Manage workspace invitation tokens and email invitations
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

// Type aliases from OpenAPI schema
export type InviteTokenCreate = components['schemas']['InviteTokenCreate'];
export type InviteTokenSummary = components['schemas']['InviteTokenSummary'];
export type InviteTokenPagination = components['schemas']['InviteTokenPagination'];

export interface EmailInvitationRequest {
  email: string;
  token: string;
}

export interface EmailInvitationResponse {
  success: boolean;
  error?: string;
}

export class InvitesModule {
  constructor(private http: HttpClient) {}

  /**
   * List all invite tokens for the current workspace
   */
  async list(): Promise<InviteTokenSummary[]> {
    const response = await this.http.get<InviteTokenPagination>('/api/groups/invitations');
    return response.items || [];
  }

  /**
   * Create a new invite token
   */
  async create(data: InviteTokenCreate): Promise<InviteTokenSummary> {
    return this.http.post<InviteTokenSummary>('/api/groups/invitations', data);
  }

  /**
   * Send an email invitation with an existing token
   */
  async sendEmail(data: EmailInvitationRequest): Promise<EmailInvitationResponse> {
    return this.http.post<EmailInvitationResponse>('/api/groups/invitations/email', data);
  }

  /**
   * Delete/revoke an invite token
   */
  async delete(tokenId: string): Promise<void> {
    await this.http.delete(`/api/groups/invitations/${tokenId}`);
  }

  /**
   * Generate invitation URL from a token
   */
  getInvitationUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || process.env.MARVIN_API_URL || 'http://localhost:8080';
    return `${base}/register?token=${token}`;
  }
}
