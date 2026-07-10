/**
 * Scheduled Tasks Module - Platform API
 *
 * Manage workspace scheduled task automation
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

// Type aliases from OpenAPI schema
export type ScheduledTask = components['schemas']['ScheduledTaskRead'];
export type ScheduledTaskCreate = components['schemas']['ScheduledTaskCreate'];
export type ScheduledTaskUpdate = components['schemas']['ScheduledTaskUpdate'];
export type ScheduledTaskExecutionLog = components['schemas']['ScheduledTaskExecutionLogRead'];

export interface TaskTypeInfo {
  task_type: string;
  name: string;
  description: string;
  config_schema?: any;
}

export class ScheduledTasksModule {
  constructor(private http: HttpClient) {}

  /**
   * List all scheduled tasks for the current workspace
   */
  async list(): Promise<ScheduledTask[]> {
    return this.http.get<ScheduledTask[]>('/api/platform/scheduled-tasks');
  }

  /**
   * Get a scheduled task by ID or slug
   */
  async get(idOrSlug: string): Promise<ScheduledTask> {
    return this.http.get<ScheduledTask>(`/api/platform/scheduled-tasks/${idOrSlug}`);
  }

  /**
   * Create a new scheduled task
   */
  async create(data: ScheduledTaskCreate): Promise<ScheduledTask> {
    return this.http.post<ScheduledTask>('/api/platform/scheduled-tasks', data);
  }

  /**
   * Update a scheduled task
   */
  async update(idOrSlug: string, data: ScheduledTaskUpdate): Promise<ScheduledTask> {
    return this.http.patch<ScheduledTask>(`/api/platform/scheduled-tasks/${idOrSlug}`, data);
  }

  /**
   * Delete a scheduled task
   */
  async delete(idOrSlug: string): Promise<void> {
    await this.http.delete<void>(`/api/platform/scheduled-tasks/${idOrSlug}`);
  }

  /**
   * Manually trigger task execution (bypass schedule)
   */
  async execute(idOrSlug: string): Promise<void> {
    await this.http.post<void>(`/api/platform/scheduled-tasks/${idOrSlug}/execute`, {});
  }

  /**
   * Get task execution history
   */
  async history(idOrSlug: string, options?: { limit?: number }): Promise<ScheduledTaskExecutionLog[]> {
    const params = new URLSearchParams();
    if (options?.limit) {
      params.set('limit', options.limit.toString());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<ScheduledTaskExecutionLog[]>(
      `/api/platform/scheduled-tasks/${idOrSlug}/history${query}`
    );
  }

  /**
   * Get available task types
   */
  async taskTypes(options?: { detailed?: boolean }): Promise<string[] | TaskTypeInfo[]> {
    const params = new URLSearchParams();
    if (options?.detailed) {
      params.set('detailed', 'true');
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<string[] | TaskTypeInfo[]>(`/api/platform/scheduled-tasks/task-types${query}`);
  }
}
