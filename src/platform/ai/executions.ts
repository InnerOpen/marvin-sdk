/**
 * AI Executions Module — Platform API
 *
 * Read and prune the immutable AI execution audit log (/api/ai/executions).
 * Deletion requires ADMIN/OWNER.
 */

import type { HttpClient } from '../../core';
import type { AIExecution, AIExecutionListParams } from './types';

export class AIExecutionsModule {
  constructor(private http: HttpClient) {}

  /**
   * List executions, newest first. Filters map to snake_case query params
   * (query params bypass the camelCase alias generator).
   */
  async list(params: AIExecutionListParams = {}): Promise<AIExecution[]> {
    return this.http.get<AIExecution[]>('/api/ai/executions', {
      operation_slug: params.operationSlug,
      status: params.status,
      entity_id: params.entityId,
      limit: params.limit,
      offset: params.offset,
    });
  }

  async get(id: string): Promise<AIExecution> {
    const validId = this.http.validatePathParam(id, 'execution ID');
    return this.http.get<AIExecution>(`/api/ai/executions/${validId}`);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'execution ID');
    await this.http.delete<void>(`/api/ai/executions/${validId}`);
  }
}
