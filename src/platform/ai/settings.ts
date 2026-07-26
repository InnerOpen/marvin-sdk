/**
 * AI Settings Module — Platform API
 *
 * Per-workspace AI workflow policy (enabled, credential mode, approval mode,
 * budgets, logging). Served at /api/groups/ai-settings — group_id comes from
 * the user session. Writes require ADMIN/OWNER.
 *
 * NOTE: the plan's /api/ai/settings path is not implemented yet; this module
 * targets the live /api/groups/ai-settings route.
 */

import type { HttpClient } from '../../core';
import type { AISettings, AISettingsUpdate } from './types';

/** One AI invocation surface, for the invocation_sources policy editor. */
export interface InvocationSource {
  key: string;
  label: string;
  description: string;
}

export class AISettingsModule {
  constructor(private http: HttpClient) {}

  /** Get the workspace AI settings (returns defaults when no row exists yet). */
  async get(): Promise<AISettings> {
    return this.http.get<AISettings>('/api/groups/ai-settings');
  }

  /** Upsert the workspace AI settings. Creates the row on first write. */
  async update(data: AISettingsUpdate): Promise<AISettings> {
    return this.http.patch<AISettings>('/api/groups/ai-settings', data);
  }

  /**
   * The catalog of AI invocation surfaces (key + label + description) for the invocation_sources
   * policy editor. A source is allowed unless `settings.invocationSources[key] === false`.
   */
  async sources(): Promise<InvocationSource[]> {
    return this.http.get<InvocationSource[]>('/api/groups/ai-settings/sources');
  }
}
