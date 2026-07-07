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
  is_active: boolean;
}

export interface WorkspaceActivationRequest {
  workspace_id: string;
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
   * Set active workspace by ID
   */
  async setActive(workspaceId: string): Promise<Workspace> {
    return this.http.put<Workspace>('/api/self/workspaces/current', {
      workspace_id: workspaceId,
    });
  }

  /**
   * Set active workspace by slug (convenience method)
   * Internally looks up the workspace by slug and calls setActive with the ID
   */
  async setActiveBySlug(slug: string): Promise<Workspace> {
    const workspaces = await this.list();
    const workspace = workspaces.find(w => w.workspace.slug === slug);

    if (!workspace) {
      throw new Error(`Workspace with slug "${slug}" not found`);
    }

    return this.setActive(workspace.workspace.id);
  }
}
