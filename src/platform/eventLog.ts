/**
 * Event Log Module - Platform API
 *
 * Query audit trail and event history
 */

import type { HttpClient } from '../core';
import type { EventLogEntry, EventLogSummary } from './types';

export interface EventLogQueryParams {
  event_type?: string;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export class EventLogModule {
  constructor(private http: HttpClient) {}

  /**
   * List events for the current workspace with optional filtering
   *
   * @param params - Query parameters for filtering events
   * @returns List of event log summaries
   *
   * @example
   * ```typescript
   * // Get recent published entries
   * const events = await marvin.platform.eventLog.list({
   *   event_type: 'entry.published',
   *   limit: 50
   * });
   *
   * // Get events by user
   * const userEvents = await marvin.platform.eventLog.list({
   *   user_id: 'user-uuid',
   *   start_date: '2026-07-01T00:00:00Z'
   * });
   * ```
   */
  async list(params?: EventLogQueryParams): Promise<EventLogSummary[]> {
    const queryParams = new URLSearchParams();

    if (params?.event_type) queryParams.append('event_type', params.event_type);
    if (params?.entity_type) queryParams.append('entity_type', params.entity_type);
    if (params?.entity_id) queryParams.append('entity_id', params.entity_id);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    const url = query ? `/api/platform/events?${query}` : '/api/platform/events';

    return this.http.get<EventLogSummary[]>(url);
  }

  /**
   * Get a single event by its event_id
   *
   * @param eventId - The event_id to retrieve
   * @returns Complete event log entry with full payload
   *
   * @example
   * ```typescript
   * const event = await marvin.platform.eventLog.get('event-uuid');
   * console.log(event.event_data); // Full JSONB payload
   * ```
   */
  async get(eventId: string): Promise<EventLogEntry> {
    return this.http.get<EventLogEntry>(`/api/platform/events/${eventId}`);
  }

  /**
   * Get complete event history for a specific entity (entry, asset, etc.)
   *
   * @param entityId - The UUID of the entity
   * @param options - Optional entity type filter and pagination
   * @returns List of events for this entity ordered by occurred_at descending
   *
   * @example
   * ```typescript
   * // Get complete timeline for an entry
   * const entryHistory = await marvin.platform.eventLog.getEntityHistory('entry-uuid', {
   *   entity_type: 'entry',
   *   limit: 100
   * });
   * ```
   */
  async getEntityHistory(
    entityId: string,
    options?: {
      entity_type?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<EventLogSummary[]> {
    const queryParams = new URLSearchParams();

    if (options?.entity_type) queryParams.append('entity_type', options.entity_type);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());

    const query = queryParams.toString();
    const url = query
      ? `/api/platform/events/entity/${entityId}?${query}`
      : `/api/platform/events/entity/${entityId}`;

    return this.http.get<EventLogSummary[]>(url);
  }

  /**
   * Get activity history for a specific user in the current workspace
   *
   * @param userId - The UUID of the user
   * @param options - Optional filters and pagination
   * @returns List of events triggered by this user ordered by occurred_at descending
   *
   * @example
   * ```typescript
   * // Get user activity for the last week
   * const userActivity = await marvin.platform.eventLog.getUserActivity('user-uuid', {
   *   start_date: '2026-07-01T00:00:00Z',
   *   event_type: 'entry.published',
   *   limit: 50
   * });
   * ```
   */
  async getUserActivity(
    userId: string,
    options?: {
      event_type?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<EventLogSummary[]> {
    const queryParams = new URLSearchParams();

    if (options?.event_type) queryParams.append('event_type', options.event_type);
    if (options?.start_date) queryParams.append('start_date', options.start_date);
    if (options?.end_date) queryParams.append('end_date', options.end_date);
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.offset) queryParams.append('offset', options.offset.toString());

    const query = queryParams.toString();
    const url = query
      ? `/api/platform/events/user/${userId}?${query}`
      : `/api/platform/events/user/${userId}`;

    return this.http.get<EventLogSummary[]>(url);
  }
}
