/**
 * Webhooks Module - Platform API
 *
 * Manage workspace webhooks
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

// Type aliases from OpenAPI schema
export type Webhook = components['schemas']['WebhookRead'];
export type WebhookCreate = components['schemas']['WebhookCreate'];
export type WebhookPagination = components['schemas']['WebhookPagination'];
export type WebhookMethod = components['schemas']['WebhookMethod'];

export interface WebhookUpdate {
  name?: string;
  url?: string;
  enabled?: boolean;
  eventTypes?: string[];
  method?: WebhookMethod;
  headers?: Record<string, string>;
}

export class WebhooksModule {
  constructor(private http: HttpClient) {}

  /**
   * List all webhooks for the current workspace
   */
  async list(): Promise<Webhook[]> {
    const response = await this.http.get<WebhookPagination>('/api/groups/webhooks');
    return response.items || [];
  }

  /**
   * Get a webhook by ID
   */
  async get(id: string): Promise<Webhook> {
    return this.http.get<Webhook>(`/api/groups/webhooks/${id}`);
  }

  /**
   * Create a new webhook
   */
  async create(data: WebhookCreate): Promise<Webhook> {
    return this.http.post<Webhook>('/api/groups/webhooks', data);
  }

  /**
   * Update a webhook
   */
  async update(id: string, data: WebhookUpdate): Promise<Webhook> {
    return this.http.put<Webhook>(`/api/groups/webhooks/${id}`, data);
  }

  /**
   * Delete a webhook
   */
  async delete(id: string): Promise<void> {
    await this.http.delete<void>(`/api/groups/webhooks/${id}`);
  }

  /**
   * Test a webhook
   */
  async test(id: string): Promise<{ success: boolean; message?: string; statusCode?: number }> {
    return this.http.post<{ success: boolean; message?: string; statusCode?: number }>(`/api/groups/webhooks/${id}/test`, {});
  }

  /**
   * Rerun failed webhooks
   */
  async rerun(): Promise<{ message: string; requeued: number }> {
    return this.http.post<{ message: string; requeued: number }>('/api/groups/webhooks/rerun', {});
  }
}
