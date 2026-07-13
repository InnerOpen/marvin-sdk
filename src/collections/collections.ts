/**
 * Collections Module - Manage collections
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinCollection, MarvinEntryListItem, PublishedCollectionSummary } from '../types';
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
  async list(): Promise<PublishedCollectionSummary[]> {
    const endpoint = `/api/publish/${this.workspaceSlug}/collections`;
    const response = await this.http.fetch<{ data: PublishedCollectionSummary[] }>(endpoint);

    return response.data || [];
  }

  /**
   * Get a single collection by slug
   * Returns null if collection is not found (404)
   */
  async get(slug: string): Promise<Collection | null> {
    try {
      const endpoint = `/api/publish/${this.workspaceSlug}/collections/${slug}`;
      const data = await this.http.fetch<MarvinCollection>(endpoint);
      return new Collection(data);
    } catch (error) {
      if (error instanceof MarvinNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get entries in a collection
   * Returns empty array if collection is not found
   */
  async entries(slug: string): Promise<MarvinEntryListItem[]> {
    const collection = await this.get(slug);
    if (!collection) {
      return [];
    }
    return collection.entries;
  }

  /**
   * Try multiple collection slugs in fallback order
   * Returns the first collection that exists and has entries
   */
  async fallback(
    slugs: string[],
    options: { requireEntries?: boolean } = {}
  ): Promise<MarvinEntryListItem[]> {
    const { requireEntries = true } = options;

    for (const slug of slugs) {
      try {
        const collection = await this.get(slug);
        if (!collection) {
          continue;
        }

        const entries = collection.entries;

        if (!requireEntries || entries.length > 0) {
          return entries;
        }
      } catch (error) {
        continue;
      }
    }

    return [];
  }
}
