/**
 * Workspace Members Module - Platform API
 *
 * Manage workspace members and their roles
 */

import type { HttpClient } from '../core';
import type {
  PlatformWorkspaceMember,
  PlatformWorkspaceMemberCreate,
  PlatformWorkspaceMemberUpdate,
} from './types';

export class WorkspaceMembersModule {
  constructor(private http: HttpClient) {}

  /**
   * List all members of a workspace
   */
  async list(workspaceId: string): Promise<PlatformWorkspaceMember[]> {
    return this.http.get<PlatformWorkspaceMember[]>(
      `/api/platform/workspaces/${workspaceId}/members`
    );
  }

  /**
   * Get a specific workspace member
   */
  async get(workspaceId: string, userId: string): Promise<PlatformWorkspaceMember> {
    return this.http.get<PlatformWorkspaceMember>(
      `/api/platform/workspaces/${workspaceId}/members/${userId}`
    );
  }

  /**
   * Add a user to a workspace with a specific role
   */
  async add(
    workspaceId: string,
    data: PlatformWorkspaceMemberCreate
  ): Promise<PlatformWorkspaceMember> {
    return this.http.post<PlatformWorkspaceMember>(
      `/api/platform/workspaces/${workspaceId}/members`,
      data
    );
  }

  /**
   * Update a workspace member's role
   */
  async updateRole(
    workspaceId: string,
    userId: string,
    data: PlatformWorkspaceMemberUpdate
  ): Promise<PlatformWorkspaceMember> {
    return this.http.put<PlatformWorkspaceMember>(
      `/api/platform/workspaces/${workspaceId}/members/${userId}`,
      data
    );
  }

  /**
   * Remove a user from a workspace
   */
  async remove(workspaceId: string, userId: string): Promise<void> {
    return this.http.delete(`/api/platform/workspaces/${workspaceId}/members/${userId}`);
  }
}
