/**
 * AI module types — Platform API
 *
 * Hand-written to mirror the backend Pydantic schemas
 * (marvin/schemas/group/ai_provider.py, ai_execution.py, ai_settings.py).
 *
 * Responses are camelCase (backend _MarvinModel uses alias_generator=camelize +
 * populate_by_name), so request bodies send camelCase to round-trip. Two exceptions:
 *  - AIOperationInfo is snake_case (returned as a raw dict, not through _MarvinModel).
 *  - AIExecutionListParams maps to snake_case query params (query params bypass the alias).
 */

// ── Models ───────────────────────────────────────────────────────────────────

export interface AIModel {
  id: string;
  providerId: string;
  groupId: string;
  name: string;
  modelId: string;
  isDefault: boolean;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  supportsVision: boolean;
  supportsTools: boolean;
  enabled: boolean;
}

export interface AIModelCreate {
  name: string;
  modelId: string;
  isDefault?: boolean;
  contextWindow?: number | null;
  maxOutputTokens?: number | null;
  supportsVision?: boolean;
  supportsTools?: boolean;
  enabled?: boolean;
}

export interface AIModelUpdate {
  name?: string;
  modelId?: string;
  isDefault?: boolean;
  contextWindow?: number | null;
  maxOutputTokens?: number | null;
  supportsVision?: boolean;
  supportsTools?: boolean;
  enabled?: boolean;
}

// ── Providers ────────────────────────────────────────────────────────────────

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'azure' | 'ollama' | 'custom';

export interface AIProvider {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  providerType: AIProviderType | string;
  secretRef: string | null;
  baseUrl: string | null;
  enabled: boolean;
  isDefault: boolean;
  metadataJson: Record<string, unknown> | null;
  models: AIModel[];
}

export interface AIProviderCreate {
  name: string;
  slug: string;
  providerType: AIProviderType | string;
  secretRef?: string | null;
  baseUrl?: string | null;
  enabled?: boolean;
  isDefault?: boolean;
  metadataJson?: Record<string, unknown> | null;
}

export interface AIProviderUpdate {
  name?: string;
  slug?: string;
  providerType?: AIProviderType | string;
  secretRef?: string | null;
  baseUrl?: string | null;
  enabled?: boolean;
  isDefault?: boolean;
  metadataJson?: Record<string, unknown> | null;
}

export interface AIProviderTestResult {
  success: boolean;
  message: string;
  availableModels: string[];
}

// ── Settings ─────────────────────────────────────────────────────────────────

export type AICredentialMode = 'platform' | 'workspace' | 'disabled';
export type AIApprovalMode = 'suggest-only' | 'allow-draft-update' | 'allow-automatic-update';

export interface AISettings {
  id: string | null;
  groupId: string | null;
  enabled: boolean;
  credentialMode: AICredentialMode | string;
  provider: string | null;
  model: string | null;
  secretRef: string | null;
  approvalMode: AIApprovalMode | string;
  invocationSources: Record<string, unknown> | null;
  operationOverrides: Record<string, unknown> | null;
  budgetConfig: Record<string, unknown> | null;
  loggingConfig: Record<string, unknown> | null;
  moderationConfig: Record<string, unknown> | null;
  /** Master switch: may the agent draw tools from registered external MCP servers? */
  externalMcpEnabled: boolean;
  /** Per-workspace AI persona: display name for the assistant (defaults to "Marvin"). */
  assistantName?: string | null;
  /** Free-text voice/tone instruction appended to the system prompt. */
  personaPrompt?: string | null;
  /** Default tone register for agent runs (axis B) — "auto" | "professional" | "playful". */
  defaultRegister?: string;
}

export interface AISettingsUpdate {
  enabled?: boolean;
  credentialMode?: AICredentialMode | string;
  provider?: string | null;
  model?: string | null;
  secretRef?: string | null;
  approvalMode?: AIApprovalMode | string;
  invocationSources?: Record<string, unknown> | null;
  operationOverrides?: Record<string, unknown> | null;
  budgetConfig?: Record<string, unknown> | null;
  loggingConfig?: Record<string, unknown> | null;
  moderationConfig?: Record<string, unknown> | null;
  externalMcpEnabled?: boolean;
  assistantName?: string | null;
  personaPrompt?: string | null;
  defaultRegister?: string;
}

// ── Operations ───────────────────────────────────────────────────────────────

/**
 * Operation metadata. NOTE: snake_case — the backend returns `op.info()` as a raw
 * dict that does not pass through the camelCase alias generator.
 */
export interface AIOperationInfo {
  slug: string;
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
  min_role: number;
  entity_types: string[];
  requires_vision: boolean;
}

export interface AIOperationExecuteRequest {
  entityType?: string | null;
  entityId?: string | null;
  input?: Record<string, unknown>;
  /** Override the workspace default model for this call. */
  modelOverride?: string | null;
  /**
   * Invocation surface (editor/forms/actions/mcp/scheduled/agent/api). Set by the calling
   * infrastructure; gated against the workspace policy ∩ the operation's declared sources.
   */
  source?: string;
}

// ── Chat (plain completion — no tools, no RAG) ────────────────────────────────

export interface AIChatRequest {
  /** The user's message. */
  message: string;
  /** Override the workspace default model for this call. */
  modelOverride?: string | null;
  /** Invocation surface; gated by the workspace policy. Defaults server-side to "agent". */
  source?: string;
}

export interface AIChatResult {
  reply: string;
  model: string;
  totalTokens: number;
  estimatedCostUsd: number | null;
  executionId: string;
}

// ── Agent (tool-calling loop) ─────────────────────────────────────────────────

/** One prior conversation turn, replayed to give the agent short-term memory. */
export interface AIAgentTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIAgentRequest {
  /** The user's goal or question. */
  message: string;
  /**
   * Prior turns, oldest first, EXCLUDING the current message. The agent is otherwise stateless —
   * each call replays what the client remembers. Bounded server-side (turn count + characters),
   * so sending a long transcript is safe: the oldest turns are simply dropped.
   */
  history?: AIAgentTurn[];
  /**
   * Optional grounding — what the caller is currently looking at. Purely informational:
   * it tells the agent what to focus on and does NOT widen permissions (`min_role` and
   * `invocation_sources` remain the wall, enforced server-side).
   */
  entityType?: string | null;
  /** UUID *or* slug; resolved server-side (slugs resolve for entry/asset/resource). */
  entityId?: string | null;
  /** Override the workspace default model for this call. Must be a tool-capable model. */
  modelOverride?: string | null;
  /** Cap the tool-call iterations. Clamped server-side (max 12). */
  maxSteps?: number | null;
  /**
   * Tone register for THIS call — independent of the workspace persona.
   *
   * The workspace `personaPrompt` governs how the assistant *addresses* you. It should not
   * govern *work product*: a review or critique written in character is not actionable. Callers
   * asking for work product should send "professional", which suppresses the persona entirely.
   *
   *  - "auto"         (default) persona applies to framing only; findings stay plain
   *  - "professional" persona suppressed — use for reviews, critiques, analyses
   *  - "playful"      persona applies fully — conversational asks
   */
  register?: 'auto' | 'professional' | 'playful';
  /** Invocation surface; gated by the workspace policy. Defaults server-side to "agent". */
  source?: string;
}

/** One tool invocation the agent made on the way to its answer. */
export interface AIAgentStep {
  tool: string;
  arguments: Record<string, unknown>;
  /** Raw tool output — a JSON string, as handed to the model. */
  result: string;
}

export interface AIAgentResult {
  answer: string;
  steps: AIAgentStep[];
  /** "complete" when the model finished; "max_steps" when the tool budget ran out. */
  stoppedReason: 'complete' | 'max_steps' | string;
  executionId: string;
  totalTokens: number;
  estimatedCostUsd: number | null;
}

// ── Tools (core registry) ─────────────────────────────────────────────────────

/**
 * Core tool metadata. NOTE: snake_case — like AIOperationInfo, the backend returns
 * `tool.info()` as a raw dict that does not pass through the camelCase alias generator.
 *
 * These are Marvin's direct-handler read/query/action capabilities (search, browse, list),
 * defined once in the core tool registry, used in-process by the internal agent and projected
 * here for external MCP hosts.
 */
export interface AIToolInfo {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  min_role: number;
  sources: string[];
  read_only: boolean;
}

export interface AIToolInvokeRequest {
  /** Tool args matching the tool's input schema. */
  args?: Record<string, unknown>;
  /** Invocation surface (e.g. "mcp"); gated by the workspace policy ∩ the tool's sources. */
  source?: string;
}

/**
 * One tool the agent loop actually binds for the caller (GET /api/ai/agent/tools) — the live
 * surface behind the Ask Marvin agent, including allowlisted external MCP tools.
 */
export interface AgentToolInfo {
  name: string;
  description: string;
  /** "builtin" for core registry / compose tools, "external" for tools from an MCP server. */
  source: 'builtin' | 'external';
  /** For external tools, the originating MCP server's display name; null otherwise. */
  server: string | null;
}

// ── Installed models + on-demand pull (Ollama) ────────────────────────────────

/** What's actually installed in the workspace's active provider (vs. registered metadata). */
export interface InstalledModels {
  providerType: string;
  /** Whether this provider can pull models on demand (Ollama). */
  supportsPull: boolean;
  models: string[];
}

export interface ModelPullRequest {
  /** Model to download, e.g. "qwen3-coder" or "nomic-embed-text". */
  name: string;
}

/** Progress of a background model pull. Poll `pullStatus` until `done`. */
export interface ModelPullStatus {
  id: string;
  name: string;
  status: 'pulling' | 'success' | 'error';
  /** Latest provider status line, e.g. "pulling manifest". */
  detail: string;
  completed: number;
  total: number;
  percent: number;
  error: string | null;
  done: boolean;
}

// ── MCP servers (external agent tool sources) ─────────────────────────────────

export type McpTransport = 'http' | 'sse';

export interface McpServer {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  transport: McpTransport | string;
  url: string;
  secretRef: string | null;
  enabled: boolean;
  /** DENY by default — only tools listed here are callable by the agent. */
  allowedTools: string[] | null;
  createdBy: string | null;
}

export interface McpServerCreate {
  name: string;
  /** Generated from name when omitted. */
  slug?: string;
  transport?: McpTransport | string;
  url: string;
  /** Slug of a WorkspaceSecret holding a Bearer token. */
  secretRef?: string | null;
  enabled?: boolean;
  allowedTools?: string[] | null;
}

export interface McpServerUpdate {
  name?: string;
  transport?: McpTransport | string;
  url?: string;
  secretRef?: string | null;
  enabled?: boolean;
  allowedTools?: string[] | null;
}

export interface McpServerToolInfo {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpServerTestResult {
  success: boolean;
  message: string;
  /** The server's advertised tools (from tools/list) — used to build the allowlist. */
  tools: McpServerToolInfo[];
}

// ── Compose ──────────────────────────────────────────────────────────────────

export interface AIComposeEntryRequest {
  /** Entry type slug or id to compose. */
  entryType: string;
  /** What the entry should be about. */
  brief: string;
  /** Image assets the model can see (vision) and that get attached to the draft. */
  assetIds?: string[] | null;
  /** Override the workspace default model for this call. */
  modelOverride?: string | null;
  /** Invocation surface (e.g. "mcp"); gated by the workspace policy. Defaults server-side. */
  source?: string;
}

/**
 * Result of composing a draft entry. The entry lands as `inbox` (draft) for review.
 * When AI is off/unconfigured a blank skeleton draft is created instead and
 * `aiSkipped` is true (executionId/tokens/cost are null in that case).
 */
export interface AIComposeEntryResult {
  entryId: string;
  status: string;
  title: string;
  editUrl: string;
  executionId: string | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  generated: Record<string, unknown>;
  /** Present and true only on the no-AI skeleton fallback path. */
  aiSkipped?: boolean;
}

export interface AIReviseEntryRequest {
  /** The entry to revise, by slug or id. */
  entry: string;
  /** What to determine / change (e.g. "determine the tags and attach relevant resources"). */
  instruction: string;
  /** Override the workspace default model for this call. */
  modelOverride?: string | null;
  /** Invocation surface (e.g. "editor"); gated by the workspace policy. Defaults server-side. */
  source?: string;
}

/**
 * Result of revising an existing entry in place. Reports the entry's tags/resources
 * after the revision so the caller can reflect the enrichment without a refetch.
 */
export interface AIReviseEntryResult {
  entryId: string;
  title: string;
  tags: string[];
  resources: string[];
  editUrl: string;
  executionId: string | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
}

// ── Executions ───────────────────────────────────────────────────────────────

export type AIExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AIExecution {
  id: string;
  groupId: string;
  operationSlug: string;
  providerType: string;
  modelId: string;
  status: AIExecutionStatus | string;
  triggeredBy: string | null;
  triggerType: string;
  entityType: string | null;
  entityId: string | null;
  outputJson: Record<string, unknown> | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  durationMs: number | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
}

export interface AIExecutionListParams {
  operationSlug?: string;
  status?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}
