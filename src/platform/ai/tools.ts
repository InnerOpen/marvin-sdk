/**
 * AI Tools Module — Platform API
 *
 * List the core tool registry and invoke a tool by name
 * (/api/ai/tools, /api/ai/tools/{name}/invoke).
 *
 * These are Marvin's direct-handler read/query/action capabilities. They are defined once in
 * the core registry, bound in-process by the internal agent, and projected here so external MCP
 * hosts (MarvinMCP) route every call through the one generic `invoke` endpoint — mirroring how
 * `AIOperationsModule` projects the operation registry.
 */

import type { HttpClient } from '../../core';
import type { AIToolInfo, AIToolInvokeRequest, AgentToolInfo } from './types';

export class AIToolsModule {
  constructor(private http: HttpClient) {}

  /** List the core tools projectable to MCP, filtered by the caller's role. */
  async list(): Promise<AIToolInfo[]> {
    return this.http.get<AIToolInfo[]>('/api/ai/tools');
  }

  /**
   * List the tools the agent loop actually binds for the caller — built-in registry tools,
   * `compose_entry`, and allowlisted external MCP tools (when the workspace master switch is on),
   * role-filtered. This is the honest "what can Marvin reach right now" surface.
   */
  async listAgent(): Promise<AgentToolInfo[]> {
    return this.http.get<AgentToolInfo[]>('/api/ai/agent/tools');
  }

  /**
   * Invoke a tool by name with raw args. Returns the tool's JSON result (shape is
   * tool-specific — the registry handler decides it).
   */
  async invoke(name: string, body: AIToolInvokeRequest = {}): Promise<Record<string, unknown>> {
    const validName = this.http.validatePathParam(name, 'tool name');
    return this.http.post<Record<string, unknown>>(`/api/ai/tools/${validName}/invoke`, body);
  }
}
