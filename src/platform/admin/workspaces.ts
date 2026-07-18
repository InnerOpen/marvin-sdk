/**
 * Admin Workspaces Module - Platform API
 *
 * Workspace membership management for administrators
 */

import type { HttpClient } from '../../core';
import type { components } from '../../generated/schema';

export type AdminWorkspaceMembership = components['schemas']['WorkspaceMembershipRead'];
export type AdminWorkspaceMemberCreate = components['schemas']['WorkspaceMemberCreate'];
export type AdminWorkspaceMemberUpdate = components['schemas']['WorkspaceMemberUpdate'];

export class AdminWorkspacesModule {
  constructor(private http: HttpClient) {}

  /**
   * List all members of a workspace
   */
  async listMembers(workspaceId: string): Promise<AdminWorkspaceMembership[]> {
    const validId = this.http.validatePathParam(workspaceId, 'workspace ID');
    return this.http.get<AdminWorkspaceMembership[]>(`/api/admin/workspaces/${validId}/members`);
  }

  /**
   * Add a member to a workspace
   */
  async addMember(workspaceId: string, data: AdminWorkspaceMemberCreate): Promise<AdminWorkspaceMembership> {
    const validId = this.http.validatePathParam(workspaceId, 'workspace ID');
    return this.http.post<AdminWorkspaceMembership>(`/api/admin/workspaces/${validId}/members`, data);
  }

  /**
   * Get a specific member of a workspace
   */
  async getMember(workspaceId: string, userId: string): Promise<AdminWorkspaceMembership> {
    const validWorkspaceId = this.http.validatePathParam(workspaceId, 'workspace ID');
    const validUserId = this.http.validatePathParam(userId, 'user ID');
    return this.http.get<AdminWorkspaceMembership>(`/api/admin/workspaces/${validWorkspaceId}/members/${validUserId}`);
  }

  /**
   * Update a workspace member's role
   */
  async updateMember(workspaceId: string, userId: string, data: AdminWorkspaceMemberUpdate): Promise<AdminWorkspaceMembership> {
    const validWorkspaceId = this.http.validatePathParam(workspaceId, 'workspace ID');
    const validUserId = this.http.validatePathParam(userId, 'user ID');
    return this.http.put<AdminWorkspaceMembership>(`/api/admin/workspaces/${validWorkspaceId}/members/${validUserId}`, data);
  }

  /**
   * Remove a member from a workspace
   */
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const validWorkspaceId = this.http.validatePathParam(workspaceId, 'workspace ID');
    const validUserId = this.http.validatePathParam(userId, 'user ID');
    await this.http.delete<void>(`/api/admin/workspaces/${validWorkspaceId}/members/${validUserId}`);
  }
}
