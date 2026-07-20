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
  entity_id?: string;
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

export interface AutomationDefinition {
  trigger?: AutomationTrigger;
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

/** The builder's vocabulary, from GET /api/automations/options. */
export interface AutomationOptions {
  /** Trigger types available (event | manual | schedule | chained | on_error | …). */
  triggerTypes: string[];
  /** Event names for trigger type "event". */
  triggers: string[];
  /** Condition operators (eq/neq/contains/exists). */
  conditionOps: string[];
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

export class AutomationsModule {
  constructor(private http: HttpClient) {}

  /** List the workspace's automations. */
  async list(): Promise<Automation[]> {
    return this.http.get<Automation[]>('/api/automations');
  }

  /** The builder's vocabulary — triggers, condition ops, action kinds, available AI operations. */
  async options(): Promise<AutomationOptions> {
    return this.http.get<AutomationOptions>('/api/automations/options');
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
  async run(id: string): Promise<{ status: string; ok: boolean; result: Record<string, unknown> }> {
    const validId = this.http.validatePathParam(id, 'automation id');
    return this.http.post(`/api/automations/${validId}/run`, {});
  }
}
