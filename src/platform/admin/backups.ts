/**
 * Admin Backups Module - Platform API
 *
 * System backup management for administrators
 */

import type { HttpClient } from '../../core';

export class AdminBackupsModule {
  constructor(private http: HttpClient) {}

  /**
   * List all available backups
   */
  async list(): Promise<unknown[]> {
    return this.http.get<unknown[]>('/api/admin/backups');
  }

  /**
   * Download a backup file by filename
   */
  async download(filename: string): Promise<unknown> {
    const validFilename = this.http.validatePathParam(filename, 'filename');
    return this.http.get<unknown>(`/api/admin/backups/${validFilename}`);
  }

  /**
   * Create a backup for a workspace
   */
  async createForWorkspace(workspaceId: string): Promise<unknown> {
    const validId = this.http.validatePathParam(workspaceId, 'workspace ID');
    return this.http.post<unknown>(`/api/admin/backups/workspaces/${validId}`, {});
  }

  /**
   * Import a backup into a workspace
   */
  async importForWorkspace(workspaceId: string, data: unknown): Promise<unknown> {
    const validId = this.http.validatePathParam(workspaceId, 'workspace ID');
    return this.http.post<unknown>(`/api/admin/backups/workspaces/${validId}/import`, data);
  }
}
