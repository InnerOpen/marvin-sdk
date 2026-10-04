/**
 * Events Module - Platform API
 *
 * Event type information for webhooks and automations
 */

import type { HttpClient } from '../core';

export interface EventVariable {
  slug: string;
  description: string;
  example: string;
  type: string;
}

export interface EventOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
  enabled?: boolean;
  variables?: EventVariable[];
  payloadExample?: Record<string, unknown>;
}

export class EventsModule {
  constructor(private http: HttpClient) {}

  /**
   * Get available event types for webhooks and automations
   */
  async getOptions(): Promise<EventOption[]> {
    return this.http.get<EventOption[]>('/api/event/types');
  }
}
