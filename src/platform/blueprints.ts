/**
 * Blueprints Module — Platform API
 *
 * The catalog of structure a workspace could have — collections, entry types, scheduled tasks and
 * workflows that core ships and installed integrations contribute — and applying them to the active
 * workspace. Each catalog entry says whether this workspace can use it (`available`,
 * `missingRequirements`), already has it (`applied`), or has an older version of it (`outdated`).
 *
 * Applying creates what is missing and never overwrites what exists, so a repeat call is a no-op;
 * the result says what happened. Reads: any member. Apply and update: workspace ADMIN.
 *
 * Routes: /api/groups/blueprints (+ /categories, /{slug}, /{slug}/apply, /{slug}/update, /apply).
 */

import type { HttpClient } from '../core';
import type { components } from '../generated/schema';

export type Blueprint = components['schemas']['BlueprintRead'];
export type BlueprintApplyResult = components['schemas']['BlueprintApplyResult'];
export type BlueprintParameter = components['schemas']['BlueprintParameter'];

export interface BlueprintListOptions {
  /** `collection`, `entry_type`, `scheduled_task`, … */
  kind?: string;
  category?: string;
  /** `core`, or a provider slug. */
  source?: string;
  /** The connection to check per-integration blueprints against (`applied`). */
  integrationId?: string;
}

export interface BlueprintApplyOptions {
  /** Pick the blueprint from this source when several share a slug. */
  source?: string;
  /** The connection a per-integration blueprint is applied for. */
  integrationId?: string;
}

const BASE = '/api/groups/blueprints';

export class BlueprintsModule {
  constructor(private http: HttpClient) {}

  private query(options: { source?: string; integrationId?: string } = {}): string {
    return this.http.buildQueryString({ source: options.source, integration_id: options.integrationId });
  }

  /** The catalog, annotated with what this workspace can do about each blueprint. */
  async list(options: BlueprintListOptions = {}): Promise<Blueprint[]> {
    return this.http.get<Blueprint[]>(BASE, {
      kind: options.kind,
      category: options.category,
      source: options.source,
      integration_id: options.integrationId,
    });
  }

  /** Category names in catalog order: core's first, then each provider's. */
  async categories(): Promise<string[]> {
    return this.http.get<string[]>(`${BASE}/categories`);
  }

  /** One blueprint, including its payload. */
  async get(slug: string, options: { source?: string } = {}): Promise<Blueprint> {
    const validSlug = this.http.validatePathParam(slug, 'blueprint slug');
    return this.http.get<Blueprint>(`${BASE}/${validSlug}`, { source: options.source });
  }

  /**
   * Create this blueprint's object in the workspace if it isn't there yet. `params` fills the
   * parameters the blueprint declares, e.g. `{ entry_type: 'post' }`. Needs ADMIN.
   */
  async apply(slug: string, params?: Record<string, unknown>, options: BlueprintApplyOptions = {}): Promise<BlueprintApplyResult> {
    const validSlug = this.http.validatePathParam(slug, 'blueprint slug');
    return this.http.post<BlueprintApplyResult>(`${BASE}/${validSlug}/apply${this.query(options)}`, params);
  }

  /**
   * Apply several blueprints at once; entry types are created before the collections and tasks that
   * use them, whatever the order here. `params` is keyed by blueprint slug. Needs ADMIN.
   */
  async applyMany(
    slugs: string[],
    params?: Record<string, Record<string, unknown>>,
    options: BlueprintApplyOptions = {}
  ): Promise<BlueprintApplyResult[]> {
    return this.http.post<BlueprintApplyResult[]>(`${BASE}/apply${this.query(options)}`, {
      slugs,
      ...(params ? { params } : {}),
    });
  }

  /** Replace an applied workflow's steps with what its integration declares now. Needs ADMIN. */
  async update(slug: string, params?: Record<string, unknown>, options: { source?: string } = {}): Promise<BlueprintApplyResult> {
    const validSlug = this.http.validatePathParam(slug, 'blueprint slug');
    return this.http.post<BlueprintApplyResult>(`${BASE}/${validSlug}/update${this.query(options)}`, params);
  }
}
