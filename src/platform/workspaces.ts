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
}
