/**
 * Entry - Rich object representing a single entry
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinEntry, MarvinAsset, MarvinCollection } from '../types';

export class Entry {
  constructor(
    private data: MarvinEntry,
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  // Expose all entry data as properties
  get id() { return this.data.id; }
  get title() { return this.data.title; }
  get slug() { return this.data.slug; }
  get summary() { return this.data.summary; }
  get description() { return this.data.description; }

  /**
   * @deprecated Use field('body') or dataJson instead. Will be removed in v3.0.0
   */
  get contentMarkdown() { return this.data.contentMarkdown; }

  /**
   * Schema-driven content data (replaces contentMarkdown in v2.0.0).
   * Access specific fields using the field() helper method.
   * @since 2.0.0
   */
  get dataJson() { return this.data.dataJson; }

  get metadata() { return this.data.metadata; }
  get status() { return this.data.status; }
  get publishedAt() { return this.data.publishedAt; }
  get createdAt() { return this.data.createdAt; }
  get updatedAt() { return this.data.updatedAt; }
  get entryTypeId() { return this.data.entryTypeId; }
  get entryType() { return this.data.entryType; }

  /**
   * Get entry assets
   */
  get assets(): MarvinAsset[] {
    return this.data.assets || [];
  }

  /**
   * Get entry collections
   */
  get collections(): MarvinCollection[] {
    return this.data.collections || [];
  }

  /**
   * Get a specific field value from the entry's schema-driven content (dataJson).
   *
   * @param key - Field key as defined in the entry type's schema
   * @returns The field value, or undefined if not present
   * @since 2.0.0
   *
   * @example
   * ```typescript
   * const entry = await client.entries.get('my-entry');
   * const body = entry.field('body');           // Get markdown body
   * const difficulty = entry.field('difficulty'); // Get difficulty level
   * const heroImage = entry.field('heroImage');  // Get hero image UUID
   * ```
   */
  field<T = unknown>(key: string): T | undefined {
    return this.data.dataJson?.[key] as T | undefined;
  }

  /**
   * Get all fields from the entry's schema-driven content.
   * @since 2.0.0
   */
  get fields(): Record<string, unknown> {
    return this.data.dataJson || {};
  }

  /**
   * Get related entries (future)
   */
  async relatedEntries(): Promise<MarvinEntry[]> {
    // TODO: Implement related entries endpoint
    throw new Error('Related entries not yet implemented');
  }

  /**
   * Get raw entry data
   */
  toJSON(): MarvinEntry {
    return this.data;
  }
}
