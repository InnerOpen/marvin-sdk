/**
 * Collections Module - Manage collections
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinCollection, MarvinEntry } from '../types';
import { Collection } from './collection';
import { MarvinNotFoundError } from '../core/errors';

export class CollectionsModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * Get all collections
   */
  async list(): Promise<MarvinCollection[]> {
    const endpoint = `/api/publish/${this.workspaceSlug}/collections`;
    const response = await this.http.fetch<{ data: MarvinCollection[] }>(endpoint);

    // Extract data from paginated response
    return response.data || [];
  }

  /**
   * Get a single collection by slug
   * Returns null if collection is not found (404)
   */
  async get(slug: string): Promise<Collection | null> {
    try {
      // TODO: Implement this endpoint in Marvin backend
      // Expected: GET /api/publish/{workspaceSlug}/collections/{slug}
      const endpoint = `/api/publish/${this.workspaceSlug}/collections/${slug}`;
      const data = await this.http.fetch<MarvinCollection>(endpoint);
      return new Collection(data, this.http, this.workspaceSlug);
    } catch (error) {
      // Return null for not found - this is a normal condition
      if (error instanceof MarvinNotFoundError) {
        return null;
      }
      // Re-throw other errors (auth, network, server)
      throw error;
    }
  }

  /**
   * Get entries in a collection
   * Returns empty array if collection is not found
   */
  async entries(slug: string): Promise<MarvinEntry[]> {
    const collection = await this.get(slug);
    if (!collection) {
      return [];
    }
    return collection.entries();
  }

  /**
   * Try multiple collection slugs in fallback order
   * Returns the first collection that exists and has entries
   *
   * @param slugs - Collection slugs to try in order
   * @param options - Options for fallback behavior
   * @returns Entries from the first matching collection, or empty array
   *
   * @example
   * ```ts
   * // Try bench-notes, then journal, then blog
   * const entries = await collections.fallback(['bench-notes', 'journal', 'blog']);
   * ```
   */
  async fallback(
    slugs: string[],
    options: { requireEntries?: boolean } = {}
  ): Promise<MarvinEntry[]> {
    const { requireEntries = true } = options;

    for (const slug of slugs) {
      try {
        const collection = await this.get(slug);
        if (!collection) {
          continue;
        }

        const entries = await collection.entries();

        // If requireEntries is true, only return if we found entries
        // If requireEntries is false, return even if empty (collection exists)
        if (!requireEntries || entries.length > 0) {
          return entries;
        }
      } catch (error) {
        // Skip this collection on any error and try the next one
        // Errors other than 404 are already logged by the HTTP client
        continue;
      }
    }

    // No matching collection found
    return [];
  }
}
