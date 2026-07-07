/**
 * Workspaces Module - Platform API
 *
 * Workspace activation and listing operations
 */

import type { HttpClient } from '../core';

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface WorkspaceWithMembership {
  workspace: Workspace;
  role: string;
  isActive: boolean;
}

export interface WorkspaceActivationRequest {
  workspace: string;
}

export interface WorkspaceCreate {
  name: string;
  slug?: string;
  description?: string | null;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string | null;
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
}
