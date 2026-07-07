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
  usesLeft?: number;
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
   * Send an email invitation
   */
  async sendEmail(data: EmailInvitationRequest): Promise<void> {
    await this.http.post<void>('/api/groups/invitations/email', data);
  }
}
