/**
 * Automations Module — Platform API (Flavor B: event → conditions → actions)
 *
 * A general workflow engine over the event bus. Actions dispatch by kind: `operation` (AI — only
 * offered when AI is enabled), `emit_event` (chain an internal event), `handler` (internal task),
 * `webhook`. Works with AI off. ADMIN/OWNER-gated server-side.
 *
 * Routes: /api/automations (CRUD) + /api/automations/options.
 */

import type { HttpClient } from '../core';

export interface AutomationCondition {
  /** Dotted path into the match context, e.g. "entry.entry_type". */
  field: string;
  /** eq | neq | contains | exists (see AutomationOptions.conditionOps). */
  op: string;
  /** Comparison value; may embed $event.* / $previous.* templates. */
  value?: unknown;
}

/**
 * One action step. NOTE: the `definition` is an opaque config blob the automation ENGINE reads by
 * exact key, so these fields are snake_case (unlike the camelCase API models) — they are the literal
 * JSON keys, not aliased.
 */
export interface AutomationAction {
  /** operation | emit_event | handler | webhook (see AutomationOptions.actionKinds). */
  kind: string;
  // operation:
  op?: string;
  input?: Record<string, unknown>;
  entity_type?: string;
  /** Target entity by id (defaults to $event.entry_id). */
  entity_id?: string;
  /** Target entry by slug — preferred for webhook payloads; resolved to the entry at run time. */
  entity_slug?: string;
  write_back?: boolean;
  // emit_event:
  event?: string;
  // handler:
  task?: string;
  config?: Record<string, unknown>;
  // webhook: reference one of the workspace's configured webhooks…
  webhook_id?: string;
  // …or (advanced) a raw url + optional Bearer secret.
  url?: string;
  body?: Record<string, unknown>;
  secret_ref?: string;
}

/** Trigger config (snake_case — literal keys the engine reads, not aliased API fields). */
export interface AutomationTrigger {
  /** event | manual | schedule | chained | on_error | incoming_webhook (mcp as it lands). Defaults to "event". */
  type?: string;
  /** For type="event": the event name, e.g. "entry_published". */
  event?: string;
  /** For type="schedule": "interval" | "once" | "cron". */
  schedule_type?: string;
  /** For type="schedule": e.g. { interval_seconds: 86400 }. */
  schedule_config?: Record<string, unknown>;
  /** For type="chained" | "on_error": target automation (slug or id); omit/"any" = every automation. */
  automation?: string;
  /** For type="incoming_webhook": target incoming webhook (slug); omit/"any" = any webhook. */
  webhook?: string;
}

/**
 * Optional target selector — the automation's "FROM" clause. When present, the automation runs a
 * query to select the entities to operate on (set-based), instead of acting on the single entity
 * its trigger handed it. Conditions then filter that set (the WHERE), and actions run per matched
 * row. Query values may be $event.* templates so a webhook can carry the query. snake_case — literal
 * keys the engine reads. Capped server-side; preview before running.
 */
export interface AutomationTarget {
  /** "entry" (collections/assets later). */
  entity?: string;
  /** Query (find_entries vocabulary): entry_type, status, text, collection, has_assets/has_images/has_resources. */
  query?: Record<string, unknown>;
}

export interface AutomationDefinition {
  trigger?: AutomationTrigger;
  target?: AutomationTarget;
  conditions?: AutomationCondition[];
  actions?: AutomationAction[];
}

export interface Automation {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  enabled: boolean;
  definition: AutomationDefinition;
  createdBy: string | null;
}

export interface AutomationCreate {
  name: string;
  slug?: string;
  enabled?: boolean;
  definition?: AutomationDefinition;
}

export interface AutomationUpdate {
  name?: string;
  enabled?: boolean;
  definition?: AutomationDefinition;
}

/** One AI operation the builder can offer as an `operation` action (only when AI is enabled). */
export interface AutomationActionOption {
  op: string;
  name: string;
  description: string;
  entityTypes: string[];
  writesBack: boolean;
}

/** One of the workspace's configured webhooks, offered to the `webhook` action. */
export interface AutomationWebhookOption {
  id: string;
  name: string;
  url: string;
  method: string;
}

/** Another automation in the workspace — a chained/on-error trigger can target it. */
export interface AutomationTargetOption {
  id: string;
  slug: string;
  name: string;
}

/** One of the workspace's incoming webhooks — an incoming_webhook trigger targets it by slug. */
export interface AutomationIncomingWebhookOption {
  id: string;
  slug: string;
  name: string;
  enabled: boolean;
  /** Whether a token has been minted (the endpoint is live). */
  hasToken: boolean;
}

/** A field a condition can reference, suggested per trigger context (guided builder). */
export interface AutomationConditionField {
  /** Dotted path, e.g. "entry.entry_type" or "event.payload." (a prefix to complete). */
  field: string;
  label: string;
  description: string;
}

/** The builder's vocabulary, from GET /api/automations/options. */
export interface AutomationOptions {
  /** Trigger types available (event | manual | schedule | chained | on_error | …). */
  triggerTypes: string[];
  /** Event names for trigger type "event". */
  triggers: string[];
  /** Condition operators (eq/neq/contains/exists). */
  conditionOps: string[];
  /** Suggested condition fields per trigger type — so the field picker offers the right fields. */
  conditionFields: Record<string, AutomationConditionField[]>;
  /** Action kinds with a registered executor. */
  actionKinds: string[];
  /** AI operations available as `operation` actions — empty when AI is off / the source is disabled. */
  operations: AutomationActionOption[];
  /** The workspace's configured (outgoing) webhooks, for the `webhook` action. */
  webhooks: AutomationWebhookOption[];
  /** Other automations in the workspace — chained/on-error triggers may target one. */
  automations: AutomationTargetOption[];
  /** The workspace's incoming (ingress) webhooks — an incoming_webhook trigger targets one. */
  incomingWebhooks: AutomationIncomingWebhookOption[];
}

/** One advisory coherence issue from POST /api/automations/validate (not a hard error). */
export interface AutomationValidationIssue {
  level: 'warning' | 'error';
  message: string;
  where: 'trigger' | 'condition' | 'action';
  /** Position within conditions/actions, when applicable. */
  index?: number | null;
}

export interface AutomationValidateResult {
  issues: AutomationValidationIssue[];
}

/** One entity a target selector resolved to (dry-run preview). */
export interface AutomationPreviewMatch {
  id: string;
  entryType?: string | null;
  status?: string | null;
  title?: string | null;
  slug?: string | null;
}

export interface AutomationPreviewResult {
  /** false when the definition has no target selector. */
  hasTarget: boolean;
  entity: string;
  /** Entities matching the query — the FROM count, before the run cap. */
  total: number;
  /** total exceeded the run cap (only the first N would run). */
  capped: boolean;
  /** The capped set that also passes conditions (the WHERE). */
  matches: AutomationPreviewMatch[];
  error?: string | null;
}

/** One recorded step within a run — which target, which action, and how it went. */
export interface AutomationActionExecution {
  id: string;
  targetIndex: number;
  targetEntityType?: string | null;
  targetEntityId?: string | null;
  actionIndex: number;
  kind: string;
  label?: string | null;
  status: string;               // success | failed
  error?: string | null;
  durationMs?: number | null;
  outputSnapshot?: Record<string, unknown> | null;
}

/** One recorded run of an automation (compact — for the history list). */
export interface AutomationExecution {
  id: string;
  automationId?: string | null;
  automationSlug: string;
  triggerType: string;
  status: string;               // running | success | partial | failed
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  targetsMatched: number;
  targetsRun: number;
  capped: boolean;
  stepsTotal: number;
  stepsOk: number;
  stepsFailed: number;
  error?: string | null;
  correlationId?: string | null;
  triggeredBy?: string | null;
}

export interface AutomationExecutionDetail extends AutomationExecution {
  definitionSnapshot?: AutomationDefinition | null;
  actions: AutomationActionExecution[];
}

export class AutomationsModule {
  constructor(private http: HttpClient) {}

  /** List the workspace's automations. */
  async list(): Promise<Automation[]> {
    return this.http.get<Automation[]>('/api/automations');
  }

  /** The builder's vocabulary — triggers, condition ops + fields, action kinds, AI operations. */
  async options(): Promise<AutomationOptions> {
    return this.http.get<AutomationOptions>('/api/automations/options');
  }

  /**
   * Advisory coherence check for a definition before saving — flags conditions/actions that
   * reference a namespace the trigger doesn't provide (e.g. entry.* under a webhook trigger).
   * Never rejects; returns issues for the builder to surface as warnings.
   */
  async validate(definition: AutomationDefinition): Promise<AutomationValidateResult> {
    return this.http.post<AutomationValidateResult>('/api/automations/validate', { definition });
  }

  /**
   * Dry-run a definition's target selector: resolve the query (with an optional test payload) and
   * return which entities it would act on — WITHOUT running anything. `total` is the full query
   * count (so you see when it's capped); `matches` is the capped set that also passes conditions.
   */
  async preview(definition: AutomationDefinition, payload: Record<string, unknown> = {}): Promise<AutomationPreviewResult> {
    return this.http.post<AutomationPreviewResult>('/api/automations/preview', { definition, payload });
  }

  async get(id: string): Promise<Automation> {
    const validId = this.http.validatePathParam(id, 'automation id');
    return this.http.get<Automation>(`/api/automations/${validId}`);
  }

  /** Create an automation (created disabled by default; enable when the definition is ready). */
  async create(body: AutomationCreate): Promise<Automation> {
    return this.http.post<Automation>('/api/automations', body);
  }

  async update(id: string, body: AutomationUpdate): Promise<Automation> {
    const validId = this.http.validatePathParam(id, 'automation id');
    return this.http.patch<Automation>(`/api/automations/${validId}`, body);
  }

  async delete(id: string): Promise<void> {
    const validId = this.http.validatePathParam(id, 'automation id');
    await this.http.delete<void>(`/api/automations/${validId}`);
  }

  /** Run an automation now (the Manual trigger). Skips the trigger + condition gates. */
  async run(id: string): Promise<{ status: string; ok: boolean; ran: number; result: Record<string, unknown> }> {
    const validId = this.http.validatePathParam(id, 'automation id');
    return this.http.post(`/api/automations/${validId}/run`, {});
  }

  /** Recent runs of an automation, newest first (status, targets, step counts, timing). */
  async executions(id: string, limit = 25): Promise<AutomationExecution[]> {
    const validId = this.http.validatePathParam(id, 'automation id');
    return this.http.get<AutomationExecution[]>(`/api/automations/${validId}/executions`, { limit });
  }

  /** One run plus its per-(target, step) records and the definition it ran against. */
  async execution(id: string, executionId: string): Promise<AutomationExecutionDetail> {
    const validId = this.http.validatePathParam(id, 'automation id');
    const validExec = this.http.validatePathParam(executionId, 'execution id');
    return this.http.get<AutomationExecutionDetail>(`/api/automations/${validId}/executions/${validExec}`);
  }
}
