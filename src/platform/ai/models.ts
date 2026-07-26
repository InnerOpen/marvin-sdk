/**
 * AI Model Management Module — Platform API
 *
 * List the models actually installed in the workspace's active provider and pull new ones on
 * demand (/api/ai/installed-models, /api/ai/models/pull). Pulling only applies to providers that
 * host their own weights (Ollama); a pull runs in the background, so `pull` returns a job and you
 * poll `pullStatus` until `done`. ADMIN/OWNER only.
 *
 * Distinct from `ai.providers.models`, which is the registered *metadata* (a model row per
 * provider). This module reflects what's really present and can download more.
 */

import type { HttpClient } from '../../core';
import type { InstalledModels, ModelPullRequest, ModelPullStatus } from './types';

export class AIModelManagementModule {
  constructor(private http: HttpClient) {}

  /** Models actually installed in the active provider right now (e.g. Ollama's /api/tags). */
  async installed(): Promise<InstalledModels> {
    return this.http.get<InstalledModels>('/api/ai/installed-models');
  }

  /** Start a background download; returns the tracking job (poll {@link pullStatus}). */
  async pull(body: ModelPullRequest): Promise<ModelPullStatus> {
    return this.http.post<ModelPullStatus>('/api/ai/models/pull', body);
  }

  /** Current progress of a pull job. */
  async pullStatus(jobId: string): Promise<ModelPullStatus> {
    const id = this.http.validatePathParam(jobId, 'job ID');
    return this.http.get<ModelPullStatus>(`/api/ai/models/pull/${id}`);
  }
}
