/**
 * AI Operations Module — Platform API
 *
 * List the system operation catalogue and execute operations
 * (/api/ai/operations, /api/ai/operations/{slug}/execute).
 *
 * NOTE: execute runs synchronously — the returned AIExecution is already
 * `completed` (or `failed`), not `pending`.
 */

import type { HttpClient } from '../../core';
import type { AIOperationInfo, AIOperationExecuteRequest, AIExecution } from './types';

export class AIOperationsModule {
  constructor(private http: HttpClient) {}

  /** List all registered system operations and their schemas. */
  async list(): Promise<AIOperationInfo[]> {
    return this.http.get<AIOperationInfo[]>('/api/ai/operations');
  }

  async get(slug: string): Promise<AIOperationInfo> {
    const validSlug = this.http.validatePathParam(slug, 'operation slug');
    return this.http.get<AIOperationInfo>(`/api/ai/operations/${validSlug}`);
  }

  /**
   * Execute an operation against an entity. Returns the completed execution
   * record (including token usage, cost, and `outputJson`).
   */
  async execute(slug: string, body: AIOperationExecuteRequest = {}): Promise<AIExecution> {
    const validSlug = this.http.validatePathParam(slug, 'operation slug');
    return this.http.post<AIExecution>(`/api/ai/operations/${validSlug}/execute`, body);
  }
}
