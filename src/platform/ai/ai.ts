/**
 * AI Module — Platform API composite
 *
 * Groups the AI sub-modules under a single `platform.ai` namespace:
 *   platform.ai.settings     — workspace AI policy
 *   platform.ai.providers    — providers (+ .models nested)
 *   platform.ai.operations   — operation catalogue + execute
 *   platform.ai.tools        — core tool registry catalogue + invoke
 *   platform.ai.executions   — execution audit log
 */

import type { HttpClient } from '../../core';
import type { AIAgentRequest, AIAgentResult, AIChatRequest, AIChatResult } from './types';
import { AISettingsModule } from './settings';
import { AIProvidersModule } from './providers';
import { AIModelManagementModule } from './models';
import { AIOperationsModule } from './operations';
import { AIToolsModule } from './tools';
import { AIMcpServersModule } from './mcpServers';
import { AIExecutionsModule } from './executions';

export class AIModule {
  public settings: AISettingsModule;
  public providers: AIProvidersModule;
  public models: AIModelManagementModule;
  public operations: AIOperationsModule;
  public tools: AIToolsModule;
  public mcpServers: AIMcpServersModule;
  public executions: AIExecutionsModule;

  constructor(private http: HttpClient) {
    this.settings = new AISettingsModule(http);
    this.providers = new AIProvidersModule(http);
    this.models = new AIModelManagementModule(http);
    this.operations = new AIOperationsModule(http);
    this.tools = new AIToolsModule(http);
    this.mcpServers = new AIMcpServersModule(http);
    this.executions = new AIExecutionsModule(http);
  }

  /**
   * Plain chat completion — no tools, no RAG (POST /api/ai/chat). Works on any model, including
   * text-only ones that can't run the agent. Ungrounded; use `operations` for grounded answers.
   */
  async chat(body: AIChatRequest): Promise<AIChatResult> {
    return this.http.post<AIChatResult>('/api/ai/chat', body);
  }

  /**
   * Agent loop (POST /api/ai/agent) — the model picks tools (search, browse, compose) and
   * chains them to reach a goal, then answers. Requires a tool-capable provider *and* model;
   * callers should degrade to `operations` / `chat` when that isn't available.
   *
   * Pass `entityType`/`entityId` to ground the run in what the user is looking at.
   */
  async agent(body: AIAgentRequest): Promise<AIAgentResult> {
    return this.http.post<AIAgentResult>('/api/ai/agent', body);
  }
}
