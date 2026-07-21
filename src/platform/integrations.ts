/**
 * Workspace Integrations Module - Platform API
 *
 * Manage credentialed connections to external services (deploy hooks, RSS, …).
 * Credentials are write-only — supplied on create/update and never returned;
 * `hasCredential` reports whether one is stored. Providers are described by the
 * catalog (`listProviders`), which drives the "add integration" UI.
 */

import type { HttpClient } from '../core';

export interface IntegrationProviderCredential {
  key: string;
  label: string;
  help: string;
  required: boolean;
}

export interface IntegrationProviderEvent {
  key: string;
  label: string;
  description: string;
}

export interface IntegrationProviderAction {
  key: string;
  label: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface IntegrationProviderInfo {
  slug: string;
  name: string;
  description: string;
  category: string; // "source" | "destination" | "capability" | "notify"
  configSchema: Record<string, unknown>;
  credentials: IntegrationProviderCredential[];
  emits: IntegrationProviderEvent[];
  actions: IntegrationProviderAction[];
}

export interface Integration {
  id: string;
  provider: string;
  name: string;
  slug: string;
  enabled: boolean;
  config: Record<string, unknown> | null;
  hasCredential: boolean;
  status: string; // "ok" | "error" | "unconfigured"
  lastCheckedAt: string | null;
  lastError: string | null;
}

export interface IntegrationCreate {
  provider: string;
  name: string;
  slug?: string;
  config?: Record<string, unknown>;
  credential?: string;
}

export interface IntegrationUpdate {
  name?: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  credential?: string;
}

export interface IntegrationActionResult {
  ok: boolean;
  result: Record<string, unknown>;
}

export interface IntegrationCheckResult {
  status: string;
  lastError: string | null;
  lastCheckedAt: string | null;
}

const BASE = '/api/groups/integrations';

export class IntegrationsModule {
  constructor(private http: HttpClient) {}

  /**
   * The provider catalog — one entry per available integration type. Drives the
   * "add integration" screen (credential + config fields, available actions).
   */
  async listProviders(): Promise<IntegrationProviderInfo[]> {
    return this.http.get<IntegrationProviderInfo[]>(`${BASE}/providers`);
  }

  /** List this workspace's configured integrations. */
  async list(): Promise<Integration[]> {
    return this.http.get<Integration[]>(BASE);
  }

  /** Create an integration. Any `credential` is written to the secret backend. */
  async create(data: IntegrationCreate): Promise<Integration> {
    return this.http.post<Integration>(BASE, data);
  }

  /** Update name/enabled/config, or rotate the credential. */
  async update(id: string, data: IntegrationUpdate): Promise<Integration> {
    const validId = this.http.validatePathParam(id, 'integration ID');
    return this.http.patch<Integration>(`${BASE}/${validId}`, data);
  }

  /** Delete an integration and its stored credential. */
  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'integration ID');
    await this.http.delete<void>(`${BASE}/${validId}`);
  }

  /** Run the provider's health check and persist the result. */
  async check(id: string): Promise<IntegrationCheckResult> {
    const validId = this.http.validatePathParam(id, 'integration ID');
    return this.http.post<IntegrationCheckResult>(`${BASE}/${validId}/check`, {});
  }

  /** Fire a provider action (also how the automation engine will call it). */
  async runAction(id: string, actionKey: string, args: Record<string, unknown> = {}): Promise<IntegrationActionResult> {
    const validId = this.http.validatePathParam(id, 'integration ID');
    const validKey = this.http.validatePathParam(actionKey, 'action key');
    return this.http.post<IntegrationActionResult>(`${BASE}/${validId}/actions/${validKey}`, args);
  }
}
