/**
 * Webhooks Module - Platform API
 *
 * Manage workspace webhooks
 */

import { HttpClient } from '../core';
import type { components } from '../generated/schema';

// Type aliases from OpenAPI schema
export type Webhook = components['schemas']['WebhookRead'];
export type WebhookCreate = components['schemas']['WebhookCreate'];
export type WebhookPagination = components['schemas']['WebhookPagination'];
export type WebhookMethod = components['schemas']['WebhookMethod'];

export type WebhookUpdate = components['schemas']['WebhookCreate'];

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
    const validId = this.http.validatePathParam(id, 'webhook ID');
    return this.http.get<Webhook>(`/api/groups/webhooks/${validId}`);
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
    const validId = this.http.validatePathParam(id, 'webhook ID');
    return this.http.put<Webhook>(`/api/groups/webhooks/${validId}`, data);
  }

  /**
   * Delete a webhook
   */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'webhook ID');
    await this.http.delete<void>(`/api/groups/webhooks/${validId}`);
  }

  /**
   * Test a webhook — fires a test request in the background
   */
  async test(id: string): Promise<{ message: string }> {
    const validId = this.http.validatePathParam(id, 'webhook ID');
    return this.http.get<{ message: string }>(`/api/groups/webhooks/${validId}/test`);
  }

  /**
   * Get execution logs for a specific webhook
   */
  async logs(id: string, options?: { limit?: number }): Promise<any[]> {
    const validId = this.http.validatePathParam(id, 'webhook ID');
    const params = options?.limit ? `?limit=${options.limit}` : '';
    return this.http.get<any[]>(`/api/groups/webhooks/${validId}/logs${params}`);
  }

  /**
   * Get workspace-wide webhook execution log
   */
  async log(options?: { limit?: number }): Promise<any[]> {
    const params = options?.limit ? `?limit=${options.limit}` : '';
    return this.http.get<any[]>(`/api/groups/webhooks/log${params}`);
  }

  /**
   * List the available webhook types
   */
  async types(): Promise<unknown[]> {
    return this.http.get<unknown[]>('/api/groups/webhooks/types');
  }

  /**
   * Rerun failed webhooks
   */
  async rerun(): Promise<{ message: string; requeued: number }> {
    return this.http.post<{ message: string; requeued: number }>('/api/groups/webhooks/rerun', {});
  }
}
