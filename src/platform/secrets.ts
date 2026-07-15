/**
 * Workspace Secrets Module - Platform API
 *
 * Manage workspace secrets referenced by {{SLUG}} in webhook headers
 * and other integration configs. Values are write-only — never returned
 * in list or read responses (like GitHub Secrets).
 */

import type { HttpClient } from '../core';

export interface WorkspaceSecret {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface WorkspaceSecretCreate {
  name: string;
  slug: string;
  description?: string | null;
  value: string;
}

export interface WorkspaceSecretUpdate {
  name?: string;
  description?: string | null;
  value?: string;
}

export class SecretsModule {
  constructor(private http: HttpClient) {}

  /**
   * List all secrets (metadata only — no values)
   */
  async list(): Promise<WorkspaceSecret[]> {
    return this.http.get<WorkspaceSecret[]>('/api/groups/secrets');
  }

  /**
   * List available slugs for {{SLUG}} autocomplete
   */
  async slugs(): Promise<string[]> {
    return this.http.get<string[]>('/api/groups/secrets/slugs');
  }

  /**
   * Create a new secret. Value is encrypted on write and never returned.
   */
  async create(data: WorkspaceSecretCreate): Promise<WorkspaceSecret> {
    return this.http.post<WorkspaceSecret>('/api/groups/secrets', data);
  }

  /**
   * Update a secret's name, description, or value.
   */
  async update(id: string, data: WorkspaceSecretUpdate): Promise<WorkspaceSecret> {
    const validId = this.http.validatePathParam(id, 'secret ID');
    return this.http.patch<WorkspaceSecret>(`/api/groups/secrets/${validId}`, data);
  }

  /**
   * Delete a secret.
   */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'secret ID');
    await this.http.delete<void>(`/api/groups/secrets/${validId}`);
  }
}
