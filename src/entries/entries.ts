/**
 * Entries Module - Manage entries
 */

import type { MarvinHttpClient } from '../client/http';
import type { MarvinEntry, MarvinEntryListItem, ListEntry, CollectionEntryMetadata, ExpandOptions } from '../types';
import { Entry, isFullEntryData } from './entry';
import { MarvinNotFoundError } from '../core/errors';

export interface GetEntriesOptions {
  entryType?: string;
  collection?: string;
  limit?: number;
  offset?: number;
  status?: string;
}

function toListEntry(raw: MarvinEntryListItem): ListEntry {
  const { collections, ...rest } = raw;
  return {
    ...rest,
    collections: (collections ?? []).map(({ collection, role, position, metadataJson }) => ({
      collection,
      entryMetadata: { role: role ?? null, position, metadataJson: metadataJson ?? null } satisfies CollectionEntryMetadata,
    })),
  };
}

export class EntriesModule {
  constructor(
    private http: MarvinHttpClient,
    private workspaceSlug: string
  ) {}

  /**
   * Get all published entries
   *
   * With `{ expand: 'full' }` each entry on the page comes back as a full `Entry` (the
   * single-entry read), so no per-entry reads are needed. A server without `expand` support
   * returns list items instead; those come back as `ListEntry[]`, as without the option.
   */
  async list(options?: GetEntriesOptions): Promise<ListEntry[]>;
  async list(options: GetEntriesOptions & ExpandOptions): Promise<Entry[] | ListEntry[]>;
  async list(options: GetEntriesOptions & ExpandOptions = {}): Promise<Entry[] | ListEntry[]> {
    const queryString = this.http.buildQueryString({
      entry_type: options.entryType,
      collection: options.collection,
      limit: options.limit,
      offset: options.offset,
      expand: options.expand,
    });

    const endpoint = `/api/publish/${this.workspaceSlug}/entries${queryString}`;
    const response = await this.http.fetch<{ data: Array<MarvinEntryListItem | MarvinEntry> }>(endpoint);
    const data = response.data || [];

    if (options.expand === 'full' && data.every(isFullEntryData)) {
      return (data as MarvinEntry[]).map((entry) => new Entry(entry));
    }
    return (data as MarvinEntryListItem[]).map(toListEntry);
  }

  /**
   * Get a single entry by slug
   * Returns null if entry is not found (404)
   */
  async get(slug: string): Promise<Entry | null> {
    try {
      const endpoint = `/api/publish/${this.workspaceSlug}/entries/${slug}`;
      const data = await this.http.fetch<MarvinEntry>(endpoint);
      return new Entry(data);
    } catch (error) {
      if (error instanceof MarvinNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Convenience: Get all pages
   */
  async pages(options?: Omit<GetEntriesOptions, 'entryType'>): Promise<ListEntry[]> {
    return this.list({ ...options, entryType: 'page' });
  }

  /**
   * Convenience: Get all blog posts
   */
  async posts(options?: Omit<GetEntriesOptions, 'entryType'>): Promise<ListEntry[]> {
    return this.list({ ...options, entryType: 'blog' });
  }

  /**
   * Convenience: Get all projects
   */
  async projects(options?: Omit<GetEntriesOptions, 'entryType'>): Promise<ListEntry[]> {
    return this.list({ ...options, entryType: 'project' });
  }
}
