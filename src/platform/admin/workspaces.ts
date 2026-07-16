/**
 * Admin Workspaces Module - Platform API
 *
 * Workspace membership management for administrators
 */

import type { HttpClient } from '../../core';
import type { components } from '../../generated/schema';

export type AdminWorkspaceMembership = components['schemas']['WorkspaceMembershipRead'];

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
   * Remove a member from a workspace
   */
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const validWorkspaceId = this.http.validatePathParam(workspaceId, 'workspace ID');
    const validUserId = this.http.validatePathParam(userId, 'user ID');
    await this.http.delete<void>(`/api/admin/workspaces/${validWorkspaceId}/members/${validUserId}`);
  }
}
