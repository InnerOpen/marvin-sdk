/**
 * Workspace Variables Module - Platform API
 *
 * Plain-text key-value config scoped to a workspace. Values are visible
 * in API responses (unlike Secrets which are write-only).
 * Referenced in webhook headers, email templates, and other configs
 * via {{SLUG}} syntax. Secrets take priority on slug collision.
 */

import type { HttpClient } from '../core';

export interface WorkspaceVariable {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  description: string | null;
  value: string;
}

export interface WorkspaceVariableCreate {
  name: string;
  slug: string;
  description?: string | null;
  value: string;
}

export interface WorkspaceVariableUpdate {
  name?: string;
  description?: string | null;
  value?: string;
}

export class VariablesModule {
  constructor(private http: HttpClient) {}

  async list(): Promise<WorkspaceVariable[]> {
    return this.http.get<WorkspaceVariable[]>('/api/groups/variables');
  }

  async create(data: WorkspaceVariableCreate): Promise<WorkspaceVariable> {
    return this.http.post<WorkspaceVariable>('/api/groups/variables', data);
  }

  async update(id: string, data: WorkspaceVariableUpdate): Promise<WorkspaceVariable> {
    const validId = this.http.validatePathParam(id, 'variable ID');
    return this.http.patch<WorkspaceVariable>(`/api/groups/variables/${validId}`, data);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'variable ID');
    await this.http.delete<void>(`/api/groups/variables/${validId}`);
  }
}
