/**
 * Entries Module - Manage entries
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinEntry } from '../types';
import { Entry } from './entry';
import { MarvinNotFoundError } from '../core/errors';

export interface GetEntriesOptions {
  entryType?: string;
  collection?: string;
  limit?: number;
  offset?: number;
  status?: string;
}

export class EntriesModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * Get all published entries
   */
  async list(options: GetEntriesOptions = {}): Promise<MarvinEntry[]> {
    const queryString = this.http.buildQueryString({
      entry_type: options.entryType,
      collection: options.collection,
      limit: options.limit,
      offset: options.offset,
      // Don't send status - backend always returns published
    });

    const endpoint = `/api/publish/${this.workspaceSlug}/entries${queryString}`;
    const response = await this.http.fetch<{ data: MarvinEntry[] }>(endpoint);

    // Extract data from paginated response
    return response.data || [];
  }

  /**
   * Get a single entry by slug
   * Returns null if entry is not found (404)
   */
  async get(slug: string): Promise<Entry | null> {
    try {
      // TODO: Implement this endpoint in Marvin backend
      // Expected: GET /api/publish/{workspaceSlug}/entries/{slug}
      const endpoint = `/api/publish/${this.workspaceSlug}/entries/${slug}`;
      const data = await this.http.fetch<MarvinEntry>(endpoint);
      return new Entry(data, this.http, this.workspaceSlug);
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
   * Convenience: Get all pages
   */
  async pages(options?: Omit<GetEntriesOptions, 'entryType'>): Promise<MarvinEntry[]> {
    return this.list({ ...options, entryType: 'page' });
  }

  /**
   * Convenience: Get all blog posts
   */
  async posts(options?: Omit<GetEntriesOptions, 'entryType'>): Promise<MarvinEntry[]> {
    return this.list({ ...options, entryType: 'blog' });
  }

  /**
   * Convenience: Get all projects
   */
  async projects(options?: Omit<GetEntriesOptions, 'entryType'>): Promise<MarvinEntry[]> {
    return this.list({ ...options, entryType: 'project' });
  }
}
