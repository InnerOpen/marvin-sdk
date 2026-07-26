/**
 * AI MCP Servers Module — Platform API
 *
 * Manage the external MCP servers a workspace's agent may draw tools from, and test their
 * connection (tools/list). ADMIN/OWNER-gated server-side. Deny-by-default: a server's tools stay
 * off until listed in `allowedTools` and the workspace `externalMcpEnabled` switch is on.
 *
 * Routes: /api/ai/mcp-servers (CRUD) + /api/ai/mcp-servers/{id}/test.
 */

import type { HttpClient } from '../../core';
import type {
  McpServer,
  McpServerCreate,
  McpServerUpdate,
  McpServerTestResult,
} from './types';

export class AIMcpServersModule {
  constructor(private http: HttpClient) {}

  /** List the workspace's registered MCP servers. */
  async list(): Promise<McpServer[]> {
    return this.http.get<McpServer[]>('/api/ai/mcp-servers');
  }

  async get(id: string): Promise<McpServer> {
    const validId = this.http.validatePathParam(id, 'mcp server id');
    return this.http.get<McpServer>(`/api/ai/mcp-servers/${validId}`);
  }

  /** Register a new MCP server (created disabled with no allowlist by default). */
  async create(body: McpServerCreate): Promise<McpServer> {
    return this.http.post<McpServer>('/api/ai/mcp-servers', body);
  }

  async update(id: string, body: McpServerUpdate): Promise<McpServer> {
    const validId = this.http.validatePathParam(id, 'mcp server id');
    return this.http.patch<McpServer>(`/api/ai/mcp-servers/${validId}`, body);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'mcp server id');
    await this.http.delete<void>(`/api/ai/mcp-servers/${validId}`);
  }

  /** Connect to the server and return its tools/list — used to build the allowlist UI. */
  async test(id: string): Promise<McpServerTestResult> {
    const validId = this.http.validatePathParam(id, 'mcp server id');
    return this.http.post<McpServerTestResult>(`/api/ai/mcp-servers/${validId}/test`, {});
  }
}
