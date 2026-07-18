/**
 * Webhooks Module - Platform API
 *
 * Manage workspace webhooks
 */

import { HttpClient, MarvinValidationError } from '../core';
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
   * Validate webhook URL to prevent SSRF attacks
   */
  private validateWebhookUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new MarvinValidationError('Webhook URL is required and must be a string');
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new MarvinValidationError('Invalid webhook URL format. Expected: https://example.com/webhook');
    }

    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new MarvinValidationError(
        `Webhook URL must use HTTP or HTTPS protocol. Got: ${parsed.protocol}`
      );
    }

    // Prevent SSRF to localhost/internal IPs
    const hostname = parsed.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '169.254.169.254', // AWS metadata service
      '[::]',
    ];

    if (blockedHosts.some(blocked => hostname === blocked || hostname.includes(blocked))) {
      throw new MarvinValidationError(
        'Webhook URL cannot target localhost or internal network addresses'
      );
    }

    // Block private IP ranges (basic check)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octets = match.slice(1).map(Number);

      // Check for private IP ranges
      // 10.0.0.0/8
      if (octets[0] === 10) {
        throw new MarvinValidationError('Webhook URL cannot target private IP range (10.x.x.x)');
      }
      // 172.16.0.0/12
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
        throw new MarvinValidationError('Webhook URL cannot target private IP range (172.16-31.x.x)');
      }
      // 192.168.0.0/16
      if (octets[0] === 192 && octets[1] === 168) {
        throw new MarvinValidationError('Webhook URL cannot target private IP range (192.168.x.x)');
      }
    }

    // Ensure URL doesn't exceed reasonable length
    if (url.length > 2048) {
      throw new MarvinValidationError('Webhook URL exceeds maximum length of 2048 characters');
    }
  }

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
