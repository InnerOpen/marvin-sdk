/**
 * Events Module - Platform API
 *
 * Event type information for webhooks and automations, and the Events hub: what sends each event type and
 * what reacts to it in the current workspace (workspace OWNER/ADMIN; platform event types are not listed).
 *
 * Routes: /api/event/types, /api/platform/event-types/connections, /api/platform/event-types/{type}/connections.
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

/** One event type's whole story: senders, reactions (switched-off ones too), recent events, the chain. */
export type EventConnections = components['schemas']['EventConnections'];
/** One row of `getConnectionsSummary`: how many senders and reactions a type has, and when it last happened. */
export type EventConnectionCounts = components['schemas']['EventConnectionCounts'];
/** Something that runs when the event happens: a workflow, integration action, email, webhook or built-in reaction. */
export type EventReaction = components['schemas']['EventReaction'];
/** Something that sends the event: Marvin itself, a workflow, an incoming webhook or a scheduled task. */
export type EventSender = components['schemas']['EventSender'];
/** The integration whose blueprint created a workflow, task, incoming webhook or integration action. */
export type EventInstalledBy = components['schemas']['InstalledBy'];

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

  /**
   * Every workspace event type, in catalog order, with how many things send it and react to it.
   */
  async getConnectionsSummary(): Promise<EventConnectionCounts[]> {
    return this.http.get<EventConnectionCounts[]>('/api/platform/event-types/connections');
  }

  /**
   * What sends an event type and what reacts to it, with its newest `limit` events (default 10, max 50).
   * Rejects with 404 for an unknown or platform-scope type.
   */
  async getConnections(eventType: string, options: { limit?: number } = {}): Promise<EventConnections> {
    const path = `/api/platform/event-types/${encodeURIComponent(eventType)}/connections`;
    return options.limit === undefined
      ? this.http.get<EventConnections>(path)
      : this.http.get<EventConnections>(path, { limit: options.limit });
  }
}
