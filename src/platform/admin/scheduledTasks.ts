/**
 * Admin Scheduled Tasks Module - Platform API
 *
 * System-wide scheduled task management for administrators
 */

import type { HttpClient } from '../../core';
import type { ScheduledTask, ScheduledTaskExecutionLog, TaskTypeInfo } from '../scheduledTasks';

export class AdminScheduledTasksModule {
  constructor(private http: HttpClient) {}

  /**
   * List all scheduled tasks across all workspaces
   */
  async list(): Promise<ScheduledTask[]> {
    return this.http.get<ScheduledTask[]>('/api/admin/scheduled-tasks');
  }

  /**
   * Get execution log for all scheduled tasks
   */
  async log(options?: { limit?: number }): Promise<ScheduledTaskExecutionLog[]> {
    const params = options?.limit ? { limit: options.limit } : undefined;
    return this.http.get<ScheduledTaskExecutionLog[]>('/api/admin/scheduled-tasks/log', params);
  }

  /**
   * Get available task types
   */
  async taskTypes(): Promise<string[] | TaskTypeInfo[]> {
    return this.http.get<string[] | TaskTypeInfo[]>('/api/admin/scheduled-tasks/task-types');
  }

  /**
   * Get a scheduled task by ID
   */
  async get(taskId: string): Promise<ScheduledTask> {
    const validId = this.http.validatePathParam(taskId, 'task ID');
    return this.http.get<ScheduledTask>(`/api/admin/scheduled-tasks/${validId}`);
  }

  /**
   * Manually trigger a scheduled task execution
   */
  async execute(taskId: string): Promise<void> {
    const validId = this.http.validatePathParam(taskId, 'task ID');
    await this.http.post<void>(`/api/admin/scheduled-tasks/${validId}/execute`, {});
  }

  /**
   * Get execution history for a scheduled task
   */
  async history(taskId: string, options?: { limit?: number }): Promise<ScheduledTaskExecutionLog[]> {
    const validId = this.http.validatePathParam(taskId, 'task ID');
    const params = options?.limit ? { limit: options.limit } : undefined;
    return this.http.get<ScheduledTaskExecutionLog[]>(
      `/api/admin/scheduled-tasks/${validId}/history`,
      params
    );
  }
}
