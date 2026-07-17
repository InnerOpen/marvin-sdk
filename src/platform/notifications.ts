/**
 * Notifications Module - Platform API
 *
 * Manage workspace notifications
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

export type Notification = components['schemas']['GroupEventNotifierRead'];
export type NotificationCreate = components['schemas']['GroupEventNotifierCreate'];
export type NotificationUpdate = components['schemas']['GroupEventNotifierUpdate'];

export class NotificationsModule {
  constructor(private http: HttpClient) {}

  /**
   * List all notifications for the current workspace
   */
  async list(): Promise<Notification[]> {
    const response = await this.http.get<{ items: Notification[] }>('/api/group/notifications');
    return response.items || [];
  }

  /**
   * Get a notification by ID
   */
  async get(id: string): Promise<Notification> {
    return this.http.get<Notification>(`/api/group/notifications/${id}`);
  }

  /**
   * Create a new notification
   */
  async create(data: NotificationCreate): Promise<Notification> {
    return this.http.post<Notification>('/api/group/notifications', data);
  }

  /**
   * Update a notification
   */
  async update(id: string, data: NotificationUpdate): Promise<Notification> {
    return this.http.put<Notification>(`/api/group/notifications/${id}`, data);
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    await this.http.delete<void>(`/api/group/notifications/${id}`);
  }

  /**
   * Test a notification
   */
  async test(id: string): Promise<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(`/api/group/notifications/${id}/test`, {});
  }
}
