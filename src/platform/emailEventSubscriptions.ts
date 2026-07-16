/**
 * Email Event Subscriptions Module - Platform API
 *
 * Manage connections between email templates and event types.
 * Each subscription fires a template to the configured recipient when an event occurs.
 */

import type { HttpClient } from '../core';

export type RecipientType = 'event_field' | 'admins' | 'specific';

export interface EmailEventSubscription {
  id: string;
  group_id: string;
  template_id: string;
  event_type: string;
  recipient_type: RecipientType;
  recipient_field: string | null;
  recipient_email: string | null;
  enabled: boolean;
  created_at: string;
  update_at: string;
}

export interface EmailEventSubscriptionCreate {
  template_id: string;
  event_type: string;
  recipient_type?: RecipientType;
  recipient_field?: string | null;
  recipient_email?: string | null;
  enabled?: boolean;
}

export class EmailEventSubscriptionsModule {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<EmailEventSubscription[]> {
    return this.http.get<EmailEventSubscription[]>('/api/groups/email-event-subscriptions');
  }

  async get(id: string): Promise<EmailEventSubscription> {
    const validId = this.http.validatePathParam(id, 'subscription ID');
    return this.http.get<EmailEventSubscription>(`/api/groups/email-event-subscriptions/${validId}`);
  }

  async create(data: EmailEventSubscriptionCreate): Promise<EmailEventSubscription> {
    return this.http.post<EmailEventSubscription>('/api/groups/email-event-subscriptions', data);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'subscription ID');
    await this.http.delete<void>(`/api/groups/email-event-subscriptions/${validId}`);
  }
}
