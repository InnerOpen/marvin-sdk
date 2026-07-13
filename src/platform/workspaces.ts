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
}
