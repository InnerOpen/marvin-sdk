/**
 * Workspaces Module - Platform API
 *
 * Workspace activation and listing operations
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

export type Workspace = components['schemas']['GroupRead'];
export type WorkspaceCreate = components['schemas']['GroupCreate'];
export type WorkspaceUpdate = components['schemas']['GroupAdminUpdate'];
export type WorkspacePreferences = components['schemas']['GroupPreferencesRead'];
export type WorkspacePreferencesUpdate = components['schemas']['GroupPreferencesUpdate'];
export type WorkspaceWithMembership = components['schemas']['WorkspaceWithMembership'];
export type WorkspacePagination = components['schemas']['GroupPagination'];

export interface WorkspaceActivationRequest {
  workspace: string;
}

export class WorkspacesModule {
  constructor(private http: HttpClient) {}

  /**
   * Get the current active workspace
   */
  async getCurrent(): Promise<Workspace> {
    return this.http.get<Workspace>('/api/self/workspaces/current');
  }

  /**
   * List all accessible workspaces
   */
  async list(): Promise<WorkspaceWithMembership[]> {
    return this.http.get<WorkspaceWithMembership[]>('/api/self/workspaces');
  }

  /**
   * Set active workspace by slug or ID
   * Backend accepts both, so no lookup needed
   */
  async setActive(workspace: string): Promise<Workspace> {
    return this.http.put<Workspace>('/api/self/workspaces/current', {
      workspace,
    });
  }

  // Admin operations (require SUPER_ADMIN or appropriate permissions)

  /**
   * Get a workspace by ID (admin)
   */
  async get(id: string): Promise<Workspace> {
    return this.http.get<Workspace>(`/api/admin/groups/${id}`);
  }

  /**
   * Create a new workspace (requires SUPER_ADMIN)
   */
  async create(data: WorkspaceCreate): Promise<Workspace> {
    return this.http.post<Workspace>('/api/admin/groups', data);
  }

  /**
   * List all workspaces/groups (admin — requires SUPER_ADMIN)
   */
  async listAdminGroups(): Promise<WorkspacePagination> {
    return this.http.get<WorkspacePagination>('/api/admin/groups');
  }

  /**
   * Update workspace settings (requires ADMIN or OWNER)
   */
  async update(id: string, data: WorkspaceUpdate): Promise<Workspace> {
    return this.http.put<Workspace>(`/api/admin/groups/${id}`, data);
  }

  /**
   * Delete a workspace (requires SUPER_ADMIN)
   */
  async delete(id: string, force: boolean = false): Promise<void> {
    const url = `/api/admin/groups/${id}${force ? '?force=true' : ''}`;
    await this.http.delete<void>(url);
  }

  /**
   * Export workspace data as JSON (collections, entry types, entries, site config)
   */
  async export(options?: { includeSystemTypes?: boolean; pretty?: boolean }): Promise<Record<string, unknown>> {
    const pretty = options?.pretty ?? true;
    const endpoint = pretty ? '/api/platform/workspace/export/pretty' : '/api/platform/workspace/export';
    const params = options?.includeSystemTypes ? { include_system_types: true } : undefined;
    return this.http.get<Record<string, unknown>>(endpoint, params);
  }

  /**
   * Import a workspace bundle (ZIP exported by exportBundle).
   *
   * Requires SUPER_ADMIN or workspace OWNER role.
   *
   * - SUPER_ADMIN: the workspace block in the bundle drives which workspace receives the import.
   * - OWNER: always imports into the caller's own workspace.
   *
   * @param file - ZIP file (from exportBundle / /export/bundle)
   * @param options.overwrite - When true, existing records matched by slug are updated.
   *   ⚠️ Overwrites entries, collections, resources, and assets; junction rows are rebuilt.
   */
  async importBundle(
    file: File | Blob,
    options?: { overwrite?: boolean }
  ): Promise<{ imported: Record<string, number> }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.request<{ imported: Record<string, number> }>(
      'POST',
      '/api/platform/workspace/import',
      { body: formData, params: options?.overwrite ? { overwrite: true } : undefined }
    );
  }

  /**
   * Get workspace preferences
   */
  async getPreferences(workspaceId: string): Promise<WorkspacePreferences> {
    return this.http.get<WorkspacePreferences>(`/api/groups/${workspaceId}/preferences`);
  }

  /**
   * Update workspace preferences
   */
  async updatePreferences(workspaceId: string, data: WorkspacePreferencesUpdate): Promise<WorkspacePreferences> {
    return this.http.patch<WorkspacePreferences>(`/api/groups/${workspaceId}/preferences`, data);
  }

  /**
   * Get platform-level stats for the current workspace
   */
  async getStats(): Promise<unknown> {
    return this.http.get<unknown>('/api/platform/stats');
  }

  /**
   * List available workspace backups
   */
  async listBackups(): Promise<unknown[]> {
    return this.http.get<unknown[]>('/api/platform/workspace/backups');
  }

  /**
   * Create a new backup of the current workspace
   */
  async createBackup(): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>('/api/platform/workspace/backups', {});
  }

  /**
   * Download a workspace backup by filename
   */
  async downloadBackup(filename: string): Promise<unknown> {
    const validFilename = this.http.validatePathParam(filename, 'filename');
    return this.http.get<unknown>(`/api/platform/workspace/backups/${validFilename}`);
  }
}
