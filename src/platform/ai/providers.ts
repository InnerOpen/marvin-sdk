/**
 * AI Providers Module — Platform API
 *
 * Manage workspace AI providers (/api/ai/providers) and their models
 * (/api/ai/providers/{id}/models). Writes and reads require ADMIN/OWNER.
 * Provider API keys are never stored here — providers reference a workspace
 * secret by slug via `secretRef`.
 */

import type { HttpClient } from '../../core';
import type {
  AIProvider,
  AIProviderCreate,
  AIProviderUpdate,
  AIProviderTestResult,
  AIModel,
  AIModelCreate,
  AIModelUpdate,
} from './types';

/**
 * Models nested under a provider. Every method takes the parent `providerId`.
 * Reached via `platform.ai.providers.models`.
 */
export class AIModelsModule {
  constructor(private http: HttpClient) {}

  async list(providerId: string): Promise<AIModel[]> {
    const pid = this.http.validatePathParam(providerId, 'provider ID');
    return this.http.get<AIModel[]>(`/api/ai/providers/${pid}/models`);
  }

  async create(providerId: string, data: AIModelCreate): Promise<AIModel> {
    const pid = this.http.validatePathParam(providerId, 'provider ID');
    return this.http.post<AIModel>(`/api/ai/providers/${pid}/models`, data);
  }

  async update(providerId: string, modelId: string, data: AIModelUpdate): Promise<AIModel> {
    const pid = this.http.validatePathParam(providerId, 'provider ID');
    const mid = this.http.validatePathParam(modelId, 'model ID');
    return this.http.patch<AIModel>(`/api/ai/providers/${pid}/models/${mid}`, data);
  }

  async delete(providerId: string, modelId: string): Promise<void> {
    const pid = this.http.validatePathParam(providerId, 'provider ID');
    const mid = this.http.validatePathParam(modelId, 'model ID');
    await this.http.delete<void>(`/api/ai/providers/${pid}/models/${mid}`);
  }
}

export class AIProvidersModule {
  /** Models nested under a provider: `platform.ai.providers.models`. */
  public models: AIModelsModule;

  constructor(private http: HttpClient) {
    this.models = new AIModelsModule(http);
  }

  async list(): Promise<AIProvider[]> {
    return this.http.get<AIProvider[]>('/api/ai/providers');
  }

  async get(id: string): Promise<AIProvider> {
    const validId = this.http.validatePathParam(id, 'provider ID');
    return this.http.get<AIProvider>(`/api/ai/providers/${validId}`);
  }

  async create(data: AIProviderCreate): Promise<AIProvider> {
    return this.http.post<AIProvider>('/api/ai/providers', data);
  }

  async update(id: string, data: AIProviderUpdate): Promise<AIProvider> {
    const validId = this.http.validatePathParam(id, 'provider ID');
    return this.http.patch<AIProvider>(`/api/ai/providers/${validId}`, data);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'provider ID');
    await this.http.delete<void>(`/api/ai/providers/${validId}`);
  }

  /** Validate the provider's credentials/connection without exposing the key. */
  async test(id: string): Promise<AIProviderTestResult> {
    const validId = this.http.validatePathParam(id, 'provider ID');
    return this.http.post<AIProviderTestResult>(`/api/ai/providers/${validId}/test`);
  }
}
