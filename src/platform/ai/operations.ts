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
import type { components } from '../../generated/schema';
import type {
  AIOperationInfo,
  AIOperationExecuteRequest,
  AIExecution,
  AIComposeEntryRequest,
  AIComposeEntryResult,
  AIReviseEntryRequest,
  AIReviseEntryResult,
} from './types';

export type AIReindexRequest = components['schemas']['AIReindexRequest'];

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

  /**
   * Rebuild the RAG embeddings index. Runs the reindex operation over the
   * workspace's published content (optionally scoped by the request body).
   */
  async reindex(body: AIReindexRequest = {}): Promise<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>('/api/ai/embeddings/reindex', body);
  }

  /**
   * Compose a DRAFT entry of `entryType` from a short brief (+ optional image
   * assets). The entry type's field schema is used as the LLM output schema, so
   * the model returns exactly the fields a valid entry needs. The draft lands as
   * `inbox` for review — publishing it fires the usual pipeline. Degrades to a
   * blank skeleton draft (`aiSkipped: true`) when AI is off or unconfigured.
   */
  async composeEntry(body: AIComposeEntryRequest): Promise<AIComposeEntryResult> {
    return this.http.post<AIComposeEntryResult>('/api/ai/compose-entry', body);
  }

  /**
   * Revise an EXISTING entry in place from an instruction — the counterpart to
   * {@link composeEntry}. Enriches an entry that already exists (e.g. "determine
   * the tags and attach relevant resources", "tighten the summary") instead of
   * authoring a new draft. Grounded on the workspace catalog so it reuses existing
   * tags and resources rather than duplicating. Unlike compose there is no skeleton
   * fallback — an unconfigured provider is an error.
   */
  async reviseEntry(body: AIReviseEntryRequest): Promise<AIReviseEntryResult> {
    return this.http.post<AIReviseEntryResult>('/api/ai/revise-entry', body);
  }
}
