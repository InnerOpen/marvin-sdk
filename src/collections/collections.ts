/**
 * Collections Module - Manage collections
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinCollection, MarvinEntry } from '../types';
import { Collection } from './collection';

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
   */
  async get(slug: string): Promise<Collection> {
    // TODO: Implement this endpoint in Marvin backend
    // Expected: GET /api/publish/{workspaceSlug}/collections/{slug}
    const endpoint = `/api/publish/${this.workspaceSlug}/collections/${slug}`;
    const data = await this.http.fetch<MarvinCollection>(endpoint);
    return new Collection(data, this.http, this.workspaceSlug);
  }

  /**
   * Get entries in a collection
   */
  async entries(slug: string): Promise<MarvinEntry[]> {
    const collection = await this.get(slug);
    return collection.entries();
  }
}
